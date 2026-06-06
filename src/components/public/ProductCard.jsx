import { Link } from 'react-router-dom';
import BtnWpp from "./BtnWpp";

export default function ProductCard({
    /* size = 'md', */
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
    const productUrl = `/producto/${product.essen_id}`;

    return (
        <div className={`relative overflow-hidden transition-all duration-300 shadow-lg card bg-base-100 ring-1 ring-gray-200 hover:shadow-2xl group ${className} ${product.discount > 0 ? "border-green-500 border shadow-green-500/40 hover:shadow-green-500/60" : ''} `}>

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
                    className="object-cover w-full h-full transition-transform duration-500 rounded-xl group-hover:scale-108"
                    onError={(e) => (e.currentTarget.src = "../../cacerola.webp")}
                />

                {/* Badges (Etiquetas) */}
                <div className="absolute left-0 flex flex-col gap-1 pt-2 w-80 top-2 z-20 pointer-events-none">
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

            {/* Contenido - Se eliminó z-10 para que el enlace lo pueda cubrir */}
            <div className="px-6 md:px-4 pb-4 pt-0 card-body gap-0">
                <div>
                    <div className="normal-case font-semibold text-gray-900 card-title">{product.name}</div>
                </div>
                <p className="text-lg text-gray-400">
                    {productLine ? `${productLine}` : ""}
                </p>

                {/* Contenedor del botón con z-20 para estar por encima del enlace */}
                <div className="relative z-20 justify-center mt-4 card-actions">
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