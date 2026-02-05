import BtnWpp from "./BtnWpp";

export default function NewDiscountCard({
    text,
    productName,
    productEssenID,
    discount,
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
                <div className="absolute top-0 left-0 w-full px-4 pt-4 pb-6 bg-gradient-to-t from-transparent to-green-400/60">
                    <h2 className="text-xl font-semibold text-green-600 uppercase drop-shadow">
                        {discount}
                    </h2>
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
