export default function AnnouncementBanner({ 
    image, 
    imageMobile, 
    title, 
    text, 
    imageRight = false, 
    className = "",
    bgColor = "#ffffff",
    container = false
}) {
    const onlyImage = !title && !text;

    return (
        <section className={`${className} my-0`}>
            <div 
                className={`flex overflow-hidden md:justify-center md:items-center ${container && "2xl:container"} mx-auto ${imageRight ? 'flex-col-reverse md:flex-row-reverse' : 'flex-col md:flex-row'}`}
                style={{ backgroundColor: bgColor }}
            >
                {/* Contenedor de la imagen dinámico */}
                <div className={onlyImage ? "w-full flex justify-center" : "w-full h-52 md:w-2/5 lg:w-1/3 md:h-auto"}>
                    {/* Imagen Mobile: Se muestra solo en móviles si se proporciona */}
                    {imageMobile && (
                        <img 
                            src={imageMobile} 
                            alt={title || "Anuncio móvil"} 
                            className={`block w-full h-full md:hidden ${onlyImage ? 'object-contain' : 'object-cover'}`} 
                        />
                    )}
                    
                    {/* Imagen Desktop/Default: Se oculta en móviles si existe imageMobile */}
                    <img 
                        src={image || "https://via.placeholder.com/400x300"} 
                        alt={title || "Anuncio"} 
                        className={`w-full h-full ${imageMobile ? 'hidden md:block' : 'block'} ${onlyImage ? 'object-contain max-h-[500px]' : 'object-cover'}`} 
                    />
                </div>
                
                {/* Contenedor de texto: Solo se renderiza si hay título o texto */}
                {!onlyImage && (
                    <div className="flex flex-col justify-center w-full p-6 md:w-fit lg:w-fit">
                        {title && <h3 className="mb-3 text-2xl font-bold text-gray-800">{title}</h3>}
                        {text && <p className="text-gray-600">{text}</p>}
                    </div>
                )}
            </div>
        </section>
    );
}