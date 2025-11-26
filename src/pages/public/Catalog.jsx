import { useEffect, useState, useMemo } from 'react';
import ProductCard from '../../components/public/ProductCard';
import { pb } from '../../lib/pocketbase';

// Pequeña función de debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // para mantener la lista completa
  const [loading, setLoading] = useState(true);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLine, setSelectedLine] = useState('');      // todas las líneas

  // Debounce del término de búsqueda (300ms)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Cargar productos iniciales
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const records = await pb.collection('products').getFullList({
          expand: 'product_line',
          sort: 'name',
        });
        setAllProducts(records);
        setProducts(records);
      } catch (err) {
        console.error(err);
        alert('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Obtener opciones únicas para los filtros (línea y tamaños)
  const productLines = useMemo(() => {
    const lines = [...new Set(allProducts.map(p => p.expand?.product_line?.name).filter(Boolean))];
    return lines.sort();
  }, [allProducts]);

  // Filtrado local (más rápido que hacer peticiones a PocketBase cada vez)
  useEffect(() => {
    let filtered = [...allProducts];

    // Filtro por nombre
    if (debouncedSearchTerm.trim()) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }

    // Filtro por línea de producto
    if (selectedLine) {
      filtered = filtered.filter(p => 
        p.expand?.product_line?.name === selectedLine
      );
    }

    setProducts(filtered);
  }, [debouncedSearchTerm, selectedLine, allProducts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Catálogo de Productos
        </h1>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Buscador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar por nombre
              </label>
              <input
                type="text"
                placeholder="Escribe el nombre del producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por línea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Línea de producto
              </label>
              <select
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las líneas</option>
                {productLines.map(line => (
                  <option key={line} value={line}>{line}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón para limpiar filtros */}
          {(searchTerm || selectedLine ) && (
            <div className="mt-4 text-right">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLine('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Resultados */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-600">
              {allProducts.length === 0
                ? 'No hay productos disponibles por el momento.'
                : 'No se encontraron productos con los filtros seleccionados.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}