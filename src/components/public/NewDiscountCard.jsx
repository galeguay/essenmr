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
        <div className="relative w-full max-w-sm overflow-hidden border shadow-xl card bg-base-100 border-base-200 group">
            
            <a 
                href={`/productos/${productEssenID}`} 
                className="absolute inset-0 z-10 cursor-pointer"
                aria-label={`Ver detalles de ${productName}`}
            ></a>

            <div className="relative block p-5 overflow-hidden aspect-square bg-amber-200">
                {image && (
                    <img
                        src={image}
                        alt={productName}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-120"
                    />
                )}
                
                <div className="absolute left-0 flex items-baseline gap-1 px-6 py-1 italic font-bold text-white shadow-lg top-5 bg-gradient-to-r from-green-500 to-emerald-400">
                    <span className="text-3xl">{discount}</span>
                    <span className="text-sm uppercase">{discountText}</span>
                </div>

            </div>

            <div className="gap-4 p-5 pt-0 card-body">
                <p className="text-lg font-semibold leading-tight text-center text-gray-500">
                    {text || productName}
                </p>

                <div className="relative z-10 flex justify-center card-actions">
                    <BtnWpp 
                        className="btn-block"
                        message={`Hola, quiero saber sobre el descuento del ${discount}% en ${productName}`} 
                    />
                </div>
            </div>
        </div>
    );
}