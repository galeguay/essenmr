import { useState, useEffect } from 'react';

export default function AnnouncementBanner({
    image,
    imageMobile,
    title,
    text,
    imageRight = false,
    className = "",
    bgColor = "#ffffff",
    container = false,
    expirationDate // Formato esperado: "HH:mm DD-MM-YYYY" (ej: "18:30 10-04-2026")
}) {
    const [isVisible, setIsVisible] = useState(true);
    const onlyImage = !title && !text;
    const noImage = !image && !imageMobile;

    useEffect(() => {
        if (!expirationDate) return;

        const [time, date] = expirationDate.split(' ');
        const [hours, minutes] = time.split(':');
        const [day, month, year] = date.split('-');

        const expiration = new Date(year, month - 1, day, hours, minutes).getTime();
        const timeRemaining = expiration - Date.now();

        if (timeRemaining <= 0) {
            setIsVisible(false);
        } else if (timeRemaining <= 2147483647) { // Evita el límite de 24.8 días de setTimeout
            const timer = setTimeout(() => setIsVisible(false), timeRemaining);
            return () => clearTimeout(timer);
        }
    }, [expirationDate]);

    if (!isVisible) return null;

    return (
        <section className={`${className} my-0`}>
            <div
                className={`flex overflow-hidden md:justify-center md:items-center ${container ? "2xl:container" : ""} mx-auto ${imageRight ? 'flex-col-reverse md:flex-row-reverse' : 'flex-col md:flex-row'}`}
                style={{ backgroundColor: bgColor }}
            >
                {/* Contenedor de la imagen */}
                {!noImage && (
                    <div className={onlyImage ? "w-full flex justify-center" : "w-full h-52 md:w-2/5 lg:w-1/3 md:h-auto"}>
                        {imageMobile && (
                            <img
                                src={imageMobile}
                                alt={title || "Anuncio móvil"}
                                className={`block w-full h-full md:hidden ${onlyImage ? 'object-contain' : 'object-cover'}`}
                            />
                        )}
                        <img
                            src={image || "https://via.placeholder.com/400x300"}
                            alt={title || "Anuncio"}
                            className={`w-full h-full ${imageMobile ? 'hidden md:block' : 'block'} ${onlyImage ? 'object-contain max-h-[500px]' : 'object-cover'}`}
                        />
                    </div>
                )}

                {/* Contenedor de texto */}
                {!onlyImage && (
                    <div className={`flex flex-col justify-center p-6 ${noImage ? 'w-full items-center text-center' : 'w-full md:w-fit lg:w-fit'}`}>
                        {title && (
                            <h3 className={`font-bold ${noImage ? 'text-4xl md:text-5xl' : 'text-2xl'}`}>
                                {title}
                            </h3>
                        )}
                        {text && (
                            <p className={`${noImage ? 'text-lg md:text-xl' : ''}`}>
                                {text}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}