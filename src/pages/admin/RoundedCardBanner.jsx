export default function RoundedCardBanner({ title, text, image, children }) {
    return (
        <section className="w-full py-8">
            <div className="container mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row items-stretch max-w-5xl mx-auto">
                    
                    {/* Contenedor de la imagen - Fijo a la izquierda en desktop, arriba en móvil */}
                    {image && (
                        <div className="w-full md:w-1/2 min-h-[300px] relative bg-gray-50">
                            <img 
                                src={image} 
                                alt={title || "Promoción"} 
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Contenedor de texto y botón - Fijo a la derecha en desktop, abajo en móvil */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                        {title && (
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                                {title}
                            </h3>
                        )}
                        
                        {text && (
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                {text}
                            </p>
                        )}
                        
                        {/* Renderizado de elementos adicionales (como el BtnWpp) */}
                        {children && (
                            <div className="mt-auto flex">
                                {children}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}