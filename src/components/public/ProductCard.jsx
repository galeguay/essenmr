import { Link } from 'react-router-dom';
import BtnWpp from "./BtnWpp";

export default function ProductCard({
    /*   size = 'md', */
    product
}) {

    if (!product) {
        return (
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="bg-gray-300 h-48 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
        );
    }

    const productLine = product.product_line?.name;
    const stockQuantity = product.stock_quantity ?? 0;
    const isOutOfStock = stockQuantity < 0;
    const productUrl = `/productos/${product.essen_id}`;

    return (
        <div className={`relative overflow-hiddenrounded-xl bg-white shadow-lg ring-1 ring-gray-200 transition-all duration-300 hover:shadow-2xl hover:ring-purple-300`}>

            <Link
                to={productUrl}
                className="absolute inset-0 z-10"
                aria-label={`Ver producto ${product.name}`}
            >
                <span className="sr-only">Ver {product.name}</span>
            </Link>

            {/* Imagen */}
            <div className="relative aspect-square flex items-center justify-center">
                {product.image ? (
                    <img
                        loading="lazy"
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover p-4"
                        onError={(e) => {
                            e.currentTarget.src = "../../cacerola.webp";
                        }}
                    />
                ) : (
                    <img
                        loading="lazy"
                        src="../../cacerola.webp"
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover p-4"
                    />
                )}

                {/* Etiquetas */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.is_new && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            Nuevo
                        </span>
                    )}

                    {isOutOfStock && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                            Sin stock
                        </span>
                    )}
                </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">
                    {product.name}
                </h3>

                {/* Línea del producto */}
                <p className="mt-1 text-sm font-medium text-gray-400 h-5">
                    {productLine && `Línea ${productLine}`}
                </p>

                {/* Descuento */}
                <div className="flex flex-col mx-8 mt-4">
                    <div
                        className={
                            product.discount > 0
                                ? "py-1 text-center uppercase font-bold rounded-t-lg bg-green-200 text-green-700"
                                : "h-8"
                        }
                    >
                        {product.discount > 0 ? `${product.discount}% de descuento` : "\u00A0"}
                    </div>
                </div>


                <div className="flex justify-center">
                    {
                        isOutOfStock ? (
                            <button
                                className="w-full rounded-lg px-5 py-2.5 text-sm font-medium bg-gray-400 text-white cursor-not-allowed"
                                disabled
                            >
                                No disponible
                            </button>
                        ) : (
                            <BtnWpp message={`Hola, entré a la página web y quiero saber el precio de ${product.name} ${product.product_line?.name}`} />
                        )
                    }
                </div>

            </div>
        </div>
    );
}
