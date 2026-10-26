import { toTitleCase } from "../utils/toTitleCase";

export default function NewReleaseCard({ productId, title, image, description, isNew, productLine, reverse }) {
    return (
        <a
            href={`/producto/${productId}`}
            className={`flex flex-col ${reverse ? "sm:flex-row-reverse" : "sm:flex-row"} bg-white overflow-hidden shadow-lg w-full max-w-2xl lg:max-w-none lg:w-[calc(100%+(100vw-100%)/2)] ${reverse ? "lg:ml-[calc((100%-100vw)/2)] lg:pl-[calc((100vw-100%)/2)]" : "lg:mr-[calc((100%-100vw)/2)] lg:pr-[calc((100vw-100%)/2)]"} border border-orange-200 hover:border-orange-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer block group`}
        >
            {/* Contenedor de la Imagen: Ajuste dinámico sin altura fija */}
            <div className="w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto sm:min-h-64 flex items-center justify-center p-4 sm:p-0 bg-stone-50 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="object-contain w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
                />
            </div>

            {/* Contenedor del Texto */}
            <div className="w-full sm:w-3/5 p-6 lg:p-10 flex flex-col justify-center">
                {productLine && (
                    <p className="mb-2 text-xs lg:text-sm font-semibold uppercase tracking-widest text-gray-500">
                        {productLine}
                    </p>
                )}

                <h3 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-5">
                    {isNew && <span className="text-orange-600">Nuevo </span>}
                    {toTitleCase(title)}
                </h3>

                <p className="text-gray-600 text-sm lg:text-lg leading-relaxed line-clamp-4 lg:line-clamp-6">
                    {description}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 font-semibold text-orange-700 group-hover:text-orange-800">
                    Ver producto
                    <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </span>
            </div>
        </a>
    );
}
