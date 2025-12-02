import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const perPage = 15;

    const fetchProducts = async () => {
        setLoading(true);

        try {
            const from = (page - 1) * perPage;
            const to = from + perPage - 1;

            let query = supabase
                .from('products')
                .select(`
          *,
          product_line(*)
        `, { count: 'exact' })
                .order('created_at', { ascending: false });

            // Filtro de búsqueda equivalente a PB
            if (search.trim() !== '') {
                query = query.or(
                    `name.ilike.%${search}%,essen_id.ilike.%${search}%`
                );
            }

            const { data, count, error } = await query.range(from, to);

            if (error) throw error;

            setProducts(data);
            setTotalPages(Math.ceil(count / perPage));
        } catch (err) {
            console.error(err);
            alert('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, search]);

    // debounce búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);


    const updateField = async (id, field, value) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ [field]: value })
                .eq('id', id);

            if (error) throw error;

            setProducts(prev =>
                prev.map(p => p.id === id ? { ...p, [field]: value } : p)
            );
        } catch (err) {
            console.error(err);
            alert("Error actualizando");
        }
    };

    const toggleField = (id, field, value) => {
        updateField(id, field, value);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
                <Link
                    to="/admin/products/new"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition shadow-md"
                >
                    + Nuevo producto
                </Link>
            </div>

            {/* Búsqueda */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar por nombre o código..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
                </div>
            ) : (
                <>
                    {/* Tabla */}
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-center">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 py-2">Essens ID</th>
                                        <th className="px-3 py-2">Nombre</th>
                                        <th className="px-3 py-2">Diámetro (cm)</th>
                                        <th className="px-3 py-2">Capacidad (L)</th>
                                        <th className="px-6 py-4">Línea</th>
                                        <th className="px-3 py-2">Visible</th>
                                        <th className="px-3 py-2">Nuevo</th>
                                        <th className="px-3 py-2">Descuento (%)</th>
                                        <th className="px-3 py-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-3 py-2">{product.essen_id}</td>
                                            <td className="px-3 py-2">{product.name}</td>
                                            <td className="px-3 py-2">{product.diameter}</td>
                                            <td className="px-3 py-2">{product.capacity}</td>
                                            <td className="px-3 py-2">
                                                {product.product_line?.name || '—'}
                                            </td>

                                            <td className="px-3 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={product.is_visible}
                                                    onChange={() =>
                                                        toggleField(product.id, "is_visible", !product.is_visible)
                                                    }
                                                />
                                            </td>

                                            <td className="px-3 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={product.is_new}
                                                    onChange={() =>
                                                        toggleField(product.id, "is_new", !product.is_new)
                                                    }
                                                />
                                            </td>

                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    className="w-20 border rounded px-2 py-1"
                                                    value={product.discount}
                                                    step="0.01"
                                                    onChange={(e) =>
                                                        updateField(product.id, "discount", Number(e.target.value))
                                                    }
                                                />
                                            </td>

                                            <td className="px-3 py-2">
                                                <Link to={`/admin/products/${product.id}`}>Editar</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <span className="px-4 py-2">
                                Página {page} de {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
