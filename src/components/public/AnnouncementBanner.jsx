import { useState, useEffect } from 'react';

export default function AnnouncementBanner({
    image,
    imageMobile,
    title,
    text,
    imageRight = false,
    titleTop = false,
    titleClassName = "",
    className = "",
    bgColor = "#ffffff",
    container = false,
    expirationDate, // Formato esperado: "HH:mm DD-MM-YYYY" (ej: "18:30 10-04-2026")
    children // Nueva prop para recibir elementos hijos
}) {
    const [isVisible, setIsVisible] = useState(true);
    // Se actualiza la condición para que no oculte la caja de texto si hay children
    const onlyImage = !title && !text && !children; 
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

    // Determina la dirección del contenedor principal
    const layoutDirection = titleTop
        ? 'flex-col-reverse'
        : imageRight
            ? 'flex-col-reverse md:flex-row-reverse'
            : 'flex-col md:flex-row';

    // Determina el ancho y disposición del contenedor de la imagen
    const imageWrapperClass = onlyImage || titleTop
        ? "w-full flex justify-center"
        : "w-full h-52 md:w-2/5 lg:w-1/3 md:h-auto";

    // Determina el ancho y disposición del contenedor del texto
    const textWrapperClass = `flex flex-col justify-center p-6 ${
        (noImage || titleTop) ? 'w-full items-center text-center' : 'w-full md:w-fit lg:w-fit'
    }`;

    return (
        <section className={`${className}`}>
            <div
                className={`flex overflow-hidden md:justify-center md:items-center py-6 ${container ? "2xl:container" : ""} mx-auto ${layoutDirection}`}
                style={{ backgroundColor: bgColor }}
            >
                {/* Contenedor de la imagen */}
                {!noImage && (
                    <div className={imageWrapperClass}>
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
                            className={`2xl:container h-full ${imageMobile ? 'hidden md:block' : 'block'} ${onlyImage ? 'object-contain max-h-[500px]' : 'object-cover'}`}
                        />
                    </div>
                )}

                {/* Contenedor de texto */}
                {!onlyImage && (
                    <div className={textWrapperClass}>
                        {title && (
                            <h3 className={`font-bold text-4xl md:text-5xl ${titleClassName}`}>
                                {title}
                            </h3>
                        )}
                        {text && (
                            <p className={`text-lg md:text-xl`}>
                                {text}
                            </p>
                        )}
                        {/* Se renderizan los children debajo del texto */}
                        {children}
                    </div>
                )}
            </div>
        </section>
    );
}