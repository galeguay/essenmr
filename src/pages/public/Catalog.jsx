import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from "react-router-dom";
import ProductCard from '../../components/public/ProductCard';
import { supabase } from '../../lib/supabase';

/* Debounce Hook */
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

export default function Catalog() {
    /* Estados principales */
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    /* Filtros */
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLine, setSelectedLine] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    /* Cargar filtros iniciales desde la URL */
    useEffect(() => {
        const urlLine = searchParams.get("product_line") || "";
        const urlSearch = searchParams.get("search") || "";

        if (urlLine) setSelectedLine(urlLine);
        if (urlSearch) setSearchTerm(urlSearch);
    }, []);

    /* Cargar productos al inicio */
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);

            try {
                const { data, error } = await supabase
                    .from('products')
                    .select(`
                        *,
                        product_line (*)
                    `)
                    .order('essen_id', { ascending: false });

                if (error) throw error;

                setAllProducts(data);
            } catch (err) {
                console.error('Error fetching discounts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    /* Obtener líneas únicas */
    const productLines = useMemo(() => {
        const lines = new Set();

        allProducts.forEach(p => {
            const lineName = p.product_line?.name || null;
            if (lineName) lines.add(lineName);
        });

        return Array.from(lines).sort();
    }, [allProducts]);


    useEffect(() => {
        const params = {};

        if (selectedLine) params.product_line = selectedLine;
        if (searchTerm) params.search = searchTerm;

        setSearchParams(params);
    }, [selectedLine, searchTerm]);

    /* Aplicar filtros locales */
    useEffect(() => {
        let filtered = [...allProducts];

        /* Filtro por texto */
        if (debouncedSearchTerm.trim()) {
            const term = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.name?.toLowerCase().includes(term) ||
                p.description?.toLowerCase().includes(term)
            );
        }

        /* Filtro por línea */
        if (selectedLine) {
            filtered = filtered.filter(p =>
                p.product_line?.name === selectedLine
            );
        }

        setProducts(filtered);
    }, [debouncedSearchTerm, selectedLine, allProducts]);


    /* Render */
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-8 bg-gray-50">
            <div className="mx-auto max-w-7xl">

                {/* Título */}
                <h1 className="mb-8 text-4xl font-bold text-center text-gray-800">
                    Catálogo de Productos
                </h1>

                {/* Filtros */}
                <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* Buscador */}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Buscar por nombre
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                placeholder="Escribe el nombre..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Select línea */}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
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

                    {/* Botón limpiar */}
                    {(searchTerm || selectedLine) && (
                        <div className="mt-4 text-right">
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedLine('');
                                }}
                                className="text-sm text-blue-600 underline hover:text-blue-800"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>

                {/* Resultados */}
                {products.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-lg shadow">
                        <p className="text-xl text-gray-600">
                            {allProducts.length === 0
                                ? 'No hay productos disponibles por el momento.'
                                : 'No se encontraron productos con los filtros seleccionados.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
