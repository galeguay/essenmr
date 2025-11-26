import { Link } from 'react-router-dom';
import BtnWpp from "./BtnWpp";

export default function ProductCard({ product }) {

  if (!product) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="bg-gray-300 h-48 rounded mb-4"></div>
        <div className="h-6 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
    );
  }

  const productLine = product.expand.product_line?.name;
  const stockQuantity = product.stock_quantity ?? 0;
  const isOutOfStock = stockQuantity < 0;
  
  const productUrl = `/products/${product.essen_id}`;

  return (
    <div className="w-full max-w-sm">
      <div className="relative h-full overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-gray-200 transition-all duration-300 hover:shadow-2xl hover:ring-purple-300">

        <Link
          to={productUrl}
          className="absolute inset-0 z-10"
          aria-label={`Ver producto ${product.name}`}
        >
          <span className="sr-only">Ver {product.name}</span>
        </Link>

        {/* Imagen */}
        <div className="relative aspect-square bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          {product.image ? (
            <img src={product.image} alt={name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <svg className="w-24 h-24 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0114 16.5a3.374 3.374 0 01-2.667-1.314l-.548-.547z" />
            </svg>
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
          {productLine && (
          <p className="mt-1 text-sm font-medium text-gray-400">
            Línea {productLine}
          </p>
          )}
          
          <div className="flex flex-col mx-8 mt-4">
            {product.discount > 0 ? (
              <div className="py-1 text-center uppercase font-bold rounded-t-lg bg-green-200 text-green-700">
                {product.discount}% de descuento
              </div>
            ) : (
              <div className="h-7"></div>
            )}
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
                <BtnWpp  />
              )
            }
          </div>

        </div>
      </div>
    </div>
  );
}
