export default function NewReleaseCard({
    productId,
    title = "Nombre del producto",
    image = null,
}) {
    return (
        <a href={`/producto/${productId}`} className="relative pt-10 w-full max-w-sm overflow-hidden rounded-3xl shadow-lg bg-white">

            {/* Imagen (forzamos relación 4:3) */}
            <div className="aspect-4/3 w-full">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover p-4"
                />
            </div>

            {/* Título superpuesto */}
            <div className="absolute top-0 left-0 w-full px-6 pb-6 pt-4 bg-linear-to-b from-gray-700/60 to-transparent">
                <h2 className="capitalize text-white text-lg font-semibold drop-shadow">
                    {title.toLowerCase()}
                </h2>
            </div>
        </a>
    );
}
