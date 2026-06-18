import { typography } from "../styles/typography";

export default function HeroFusionBanner({ 
    title, 
    text, 
    image, 
    children, 
    backgroundColor = "bg-black",
    link = "#",
    titleColor = "text-white",
    textColor = "text-gray-300"
}) {
    return (
        <a href={link} className={`block w-full ${backgroundColor} py-0 no-underline`}>
            {/* Contenedor principal */}
            <div className="relative w-full flex flex-col md:flex-row min-h-[450px]">
                
                {/* Contenido Izquierdo */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 z-10 bg-transparent">
                    {title && (
                        <h2 className={`${typography.sectionTitle} ${titleColor} mb-6 leading-tight`}>
                            {title}
                        </h2>
                    )}
                    {text && (
                        <p className={`text-lg md:text-xl ${textColor} mb-10 leading-relaxed`}>
                            {text}
                        </p>
                    )}
                    {/* Evitamos que el botón de whatsapp dentro genere conflicto de links anidados */}
                    <div onClick={(e) => e.stopPropagation()}>
                        {children}
                    </div>
                </div>

                {/* Imagen Derecha con máscara */}
                <div className="w-full md:w-1/2 relative flex">
                    <img 
                        src={image} 
                        alt={title} 
                        className="w-full h-64 md:h-full object-cover 
                                   [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_20%)] 
                                   [mask-image:linear-gradient(to_bottom,transparent,black_20%)] 
                                   md:[-webkit-mask-image:linear-gradient(to_right,transparent,black_15%)] 
                                   md:[mask-image:linear-gradient(to_right,transparent,black_15%)]"
                    />
                </div>
            </div>
        </a>
    );
}