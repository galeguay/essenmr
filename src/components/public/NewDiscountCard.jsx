import BtnWpp from "./BtnWpp";

export default function NewDiscountCard({
  text,
  productName,
  productEssenID,
  discount,
  image = null,
}) {
  return (
    <a
    href={!text ? `/productos/${productEssenID}` : undefined}
    className="relative w-full max-w-sm overflow-hidden rounded-s shadow-lg">

      {/* Imagen (forzamos relación 4:3) */}
      <div className="aspect-4/4 w-full">
        {image ? (
          <img
            src={image}
            alt="Imagen ilustrativa del descuento"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full "></div>
        )}
      </div>

      {/* Etiqueta de descuento */}
      <div className="absolute top-0 left-0 w-full px-4 pt-4 pb-6 bg-gradient-to-t from-transparent to-green-400/60">
        <h2 className="text-green-600 text-xl uppercase font-semibold drop-shadow">
          {discount}% DE DESCUENTO
        </h2>
      </div>

      {/* Título superpuesto */}
      <div className="absolute bottom-0 w-full p-4 bg-linear-to-b flex flex-col justify-center">
        <p className={`text-gray-500 font-semibold mb-2 ${!text ? "text-center text-lg" : ""}`}>
          {text ? text : productName}
        </p>
        <BtnWpp message={`Hola, quiero saber sobre el descuento del ${discount}% en ${productName}`}/>
      </div>
    </a>
  );
}
