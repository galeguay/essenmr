import { Link } from 'react-router-dom';
import BtnWpp from "./BtnWpp";

export default function ProductCard({
    /*   size = 'md', */
    product,
    className
}) {

    if (!product) {
        return (
            <div className="p-6 bg-white rounded-lg shadow animate-pulse">
                <div className="h-48 mb-4 bg-gray-300 rounded"></div>
                <div className="h-6 mb-2 bg-gray-300 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
            </div>
        );
    }

    const productLine = product.product_line?.name;
    const stockQuantity = product.stock_quantity ?? 0;
    const isOutOfStock = stockQuantity < 0;
    const productUrl = `/productos/${product.essen_id}`;

    return (
        <div className={`overflow-hidden transition-all duration-300 shadow-lg card bg-base-100 ring-1 ring-gray-200 hover:shadow-2xl group ${className}`}>

            {/* Enlace invisible que cubre toda la tarjeta */}
            <Link to={productUrl} className="absolute inset-0 z-10" aria-label={`Ver producto ${product.name}`}>
                <span className="sr-only">Ver {product.name}</span>
            </Link>

            {/* Imagen con Badge de DaisyUI */}
            <figure className="relative p-4 aspect-square">
                <img
                    loading="lazy"
                    src={product.image || "../../cacerola.webp"}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform duration-500 rounded-xl group-hover:scale-110"
                    onError={(e) => (e.currentTarget.src = "../../cacerola.webp")}
                />

                {/* Badges (Etiquetas) */}
                <div className="absolute left-0 flex flex-col gap-1 pt-3 w-80 top-2">
                    {product.discount > 0 &&
                        <div className="px-6 font-bold text-white uppercase bg-green-500 w-fit to-emerald-300">
                            <span className="text-2xl">{product.discount}</span>
                            <span className="text-sm uppercase">% descuento</span>
                        </div>}

                    {product.is_new &&
                        <div className="px-6 text-sm font-bold text-white uppercase bg-blue-500 w-fit">
                            Nuevo
                        </div>}

                    {isOutOfStock &&
                        <div className="px-6 text-sm font-bold text-white uppercase bg-gray-400 w-fit">
                            Sin Stock
                        </div>}
                </div>
            </figure>

            {/* Contenido */}
            <div className="z-10 p-6 pt-0 card-body gap-0">
                <div className="capitalize font-semibold text-gray-900 card-title">{product.name.toLowerCase()}</div>
                <p className="font-semibold text-gray-400">
                    {productLine ? `${productLine}` : ""}
                </p>

                <div className="justify-center mt-3 card-actions">
                    {isOutOfStock ? (
                        <button className="btn btn-disabled btn-block" disabled>No disponible</button>
                    ) : (
                        <BtnWpp
                            className="btn-block"
                            message={`Hola, quiero saber el precio de ${product.name} ${product.product_line?.name}`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
