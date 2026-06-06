export default function NewReleaseCard({ productId, title, image, description }) {
    return (
        <a 
            href={`/producto/${productId}`}
            className="flex flex-col sm:flex-row bg-gray-900 rounded-xl overflow-hidden shadow-lg w-full max-w-2xl border border-gray-800 hover:border-gray-600 hover:shadow-xl transition-all cursor-pointer block group"
        >
            {/* Contenedor de la Imagen: Ajuste dinámico sin altura fija */}
            <div className="w-full sm:w-2/5 flex items-center justify-center p-4 sm:p-0">
                <img
                    src={image}
                    alt={title}
                    className="object-contain w-full h-auto group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Contenedor del Texto */}
            <div className="w-full sm:w-3/5 p-6 flex flex-col justify-center">
                {/* Título posicionado encima de la descripción, manteniendo el estilo capitalize de tu versión anterior */}
                <h3 className="text-2xl font-bold text-white mb-3 capitalize">
                    {title.toLowerCase()}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
                    {description}
                </p>
            </div>
        </a>
    );
}