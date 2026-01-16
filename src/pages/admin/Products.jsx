import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Helper para Debounce
const useDebouncedCallback = (callback, delay) => {
    const [timeoutId, setTimeoutId] = useState(null);

    return useCallback((...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        const newTimeoutId = setTimeout(() => {
            callback(...args);
        }, delay);

        setTimeoutId(newTimeoutId);
    }, [callback, delay, timeoutId]);
};

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    // Nuevo estado para rastrear la actualización del descuento y mostrar feedback
    const [discountFeedback, setDiscountFeedback] = useState({});

    const perPage = 15;

    const fetchProducts = useCallback(async () => {
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
            if (search.trim() !== "") {
                const s = search.trim();
                query = query.ilike("name", `%${s}%`);
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
    }, [page, search]);

    useEffect(() => {
        fetchProducts();
    }, [page, search, fetchProducts]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
        }, 400);

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

            // Mostrar feedback de éxito temporalmente solo para el campo 'discount'
            if (field === 'discount') {
                setDiscountFeedback(prev => ({ ...prev, [id]: 'success' }));
                setTimeout(() => {
                    setDiscountFeedback(prev => ({ ...prev, [id]: null }));
                }, 6000);
            }

        } catch (err) {
            console.error(err);
            alert("Error actualizando");
            // Mostrar feedback de error temporalmente solo para el campo 'discount'
            if (field === 'discount') {
                setDiscountFeedback(prev => ({ ...prev, [id]: 'error' }));
                setTimeout(() => {
                    setDiscountFeedback(prev => ({ ...prev, [id]: null }));
                }, 5000);
            }
        }
    };

    const toggleField = (id, field, value) => {
        updateField(id, field, value);
    };

    // 1. Función para actualizar el estado local del producto inmediatamente
    const handleLocalDiscountChange = (id, value) => {
        setProducts(prev =>
            prev.map(p => p.id === id ? { ...p, discount: value } : p)
        );
        // Quitar cualquier feedback de actualización anterior al empezar a escribir
        setDiscountFeedback(prev => ({ ...prev, [id]: null }));

        // Llamar a la función debounced para la actualización de la BD
        debouncedUpdateDiscount(id, value);
    };

    // 2. Función base para la actualización de la BD solo para el descuento
    const updateDiscountInDB = (id, value) => {
        updateField(id, 'discount', value);
    };

    // 3. Debounce para la actualización de la BD (2000 ms = 2 segundos)
    const debouncedUpdateDiscount = useDebouncedCallback(updateDiscountInDB, 1000);


    return (
        <div className="p-6 mx-auto max-w-7xl">
            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
                <Link
                    to="/admin/products/new"
                    className="px-6 py-3 font-medium text-white transition bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700"
                >
                    Agregar producto
                </Link>
            </div>

            {/* Búsqueda */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar por nombre"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mb-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn btn-soft btn-sm"
                    >
                        Anterior
                    </button>
                    <span className="px-4 py-2">
                        Página {page} de {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="btn btn-soft btn-sm"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-b-4 border-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {/* Tabla */}
                    <div className="overflow-hidden bg-white shadow-lg rounded-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-center">
                                <thead className="text-center text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        {/* Nueva columna para la imagen */}
                                        <th className="px-3 py-2">Imagen</th>
                                        <th className="px-3 py-2">Nombre</th>
                                        <th className="px-6 py-4">Línea</th>
                                        <th className="px-3 py-2">Essen ID</th>
                                        <th className="px-3 py-2">Diámetro (cm)</th>
                                        <th className="px-3 py-2">Capacidad (L)</th>
                                        <th className="px-3 py-2">Visible</th>
                                        <th className="px-3 py-2">Nuevo</th>
                                        <th className="px-3 py-2">Descuento (%)</th>
                                        <th className="px-3 py-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            {/* Celda de la imagen */}
                                            <td className="px-3 py-2">
                                                <img
                                                    src={product.image || 'url-por-defecto-o-placeholder'}
                                                    className="object-cover w-12 h-12 mx-auto rounded-md"
                                                />
                                            </td>
                                            <td className="px-3 py-2">{product.name}</td>
                                            <td className="px-3 py-2">
                                                {product.product_line?.name || '—'}
                                            </td>
                                            <td className="px-3 py-2">{product.essen_id}</td>
                                            <td className="px-3 py-2">{product.diameter}</td>
                                            <td className="px-3 py-2">{product.capacity}</td>


                                            {/* Toggle de DaisyUI para Visible */}
                                            <td className="px-3 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={product.is_visible}
                                                    onChange={() =>
                                                        toggleField(product.id, "is_visible", !product.is_visible)
                                                    }
                                                    className="toggle toggle-success"
                                                />
                                            </td>

                                            {/* Toggle de DaisyUI para Nuevo */}
                                            <td className="px-3 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={product.is_new}
                                                    onChange={() =>
                                                        toggleField(product.id, "is_new", !product.is_new)
                                                    }
                                                    className="toggle toggle-success"
                                                />
                                            </td>

                                            {/* Celda del Descuento (con Debounce y Feedback) */}
                                            <td className="px-3 py-2">
                                                {/* 💡 AÑADE ESTE CONTENEDOR FLEX CON ESPACIO */}
                                                <div className="flex items-center justify-center gap-2">
                                                    <input
                                                        type="number"
                                                        className="w-20 px-2 py-1 border rounded"
                                                        value={product.discount == null ? '' : product.discount}
                                                        step="0.01"
                                                        onChange={(e) =>
                                                            handleLocalDiscountChange(product.id, Number(e.target.value))
                                                        }
                                                        onClick={(e) => e.target.select()}
                                                    />
                                                    {/* 💡 AÑADE ESTE CONTENEDOR PARA EL FEEDBACK CON ANCHO FIJO */}
                                                    <div className="flex items-center justify-center w-6 h-6">
                                                        {/* Feedback de Actualización */}
                                                        {discountFeedback[product.id] === 'success' && (
                                                            <i className="text-xl font-bold text-green-500 bi bi-check-circle-fill" title="Actualizado"></i>
                                                        )}
                                                        {discountFeedback[product.id] === 'error' && (
                                                            <i className="text-xl font-bold text-red-500 bi bi-check-circle-fill" title="Error de actualización"></i>
                                                        )}
                                                    </div>
                                                </div>
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
                        <div className="flex justify-center gap-2 mt-6">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn btn-soft btn-sm"
                            >
                                Anterior
                            </button>
                            <span className="px-4 py-2">
                                Página {page} de {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn btn-soft btn-sm"
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