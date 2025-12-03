export default function NewReleaseCard({
  title = "Nombre del producto",
  image = null,
}) {
  return (
    <a href="/producto/key" className="relative w-full max-w-sm overflow-hidden rounded-s shadow-lg">

      {/* Imagen (forzamos relación 4:3) */}
      <div className="aspect-4/3 w-full">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300"></div>
        )}
      </div>

      {/* Título superpuesto */}
      <div className="absolute top-0 left-0 w-full p-4 bg-linear-to-b from-gray-700/60 to-transparent">
        <h2 className="text-white text-lg font-semibold drop-shadow">
          {title}
        </h2>
      </div>
    </a>
  );
}
