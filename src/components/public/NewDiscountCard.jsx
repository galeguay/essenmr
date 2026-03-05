import BtnWpp from "./BtnWpp";

export default function NewDiscountCard({
    text,
    productName,
    productEssenID,
    discount,
    discountText,
    image = null,
}) {
    return (
        <div className="relative w-full max-w-sm pb-10 overflow-hidden shadow-lg rounded-s">

            <a href={`/productos/${productEssenID}`} className="block">
                {/* Imagen */}
                <div className="w-full p-5 aspect-4/4">
                    {image && (
                        <img
                            src={image}
                            alt="Imagen ilustrativa del descuento"
                            className="object-cover w-full h-full"
                        />
                    )}
                </div>

                {/* Etiqueta */}
                <div className="absolute top-0 left-0 flex w-full px-4 pt-4 pb-6 bg-gradient-to-t from-transparent to-green-400/60">
                    <div className="flex items-center px-5 py-1 text-2xl font-bold text-green-600 uppercase bg-white rounded-full drop-shadow">
                        {discount}<span className="text-lg ms-2">{discountText}</span>
                    </div>
                </div>
            </a>

            {/* Footer */}
            <div className="absolute bottom-0 flex flex-col w-full px-4 pb-4">
                <p className="mb-2 text-lg font-semibold text-center text-gray-500">
                    {text ?? productName}
                </p>

                <BtnWpp message={`Hola, quiero saber sobre el descuento del ${discount}% en ${productName}`} />
            </div>
        </div>

    );
}
