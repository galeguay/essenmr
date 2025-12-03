import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ProductLines() {

    const [productLines, setProductLines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 15;
    const fetchProductLines = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("product_lines")
                .select("*", { count: "exact" })  // ← importante para saber totalItems
                .order("created_at", { ascending: false }); // PB: sort: "-created"

            // Filtro por búsqueda
            if (search) {
                query = query.ilike("name", `%${search}%`);
            }

            // Paginación (Supabase usa rango)
            const from = (page - 1) * perPage;
            const to = from + perPage - 1;

            query = query.range(from, to);

            const { data, count, error } = await query;


            if (error) throw error;

            setProductLines(data);
            setTotalPages(Math.ceil(count / perPage));

        } catch (error) {
            console.error("Error cargando líneas:", error);
            alert("No se pudieron cargar las líneas de productos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductLines();
    }, [page, search]);

    // Búsqueda con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const updateField = async (id, field, value) => {
        try {
            const { error } = await supabase
                .from('product_lines')
                .update({ [field]: value })
                .eq('id', id);

            if (error) throw error;

            setProductLines(prev =>
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
                <h1 className="text-3xl font-bold text-gray-800">Lineas de productos</h1>
                <Link
                    to="/admin/productLines/new"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition shadow-md"
                >
                    + Nuevo Línea
                </Link>
            </div>

            {/* Barra de búsqueda */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
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
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visible</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {productLines.map((pl) => (
                                        <tr key={pl.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                {pl.image ? (
                                                    <img
                                                        src={pl.image}
                                                        alt={pl.name}
                                                        className="w-12 h-12 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 border-2 border-dashed rounded-lg"></div>
                                                )}
                                            </td>

                                            {/* NOMBRE */}
                                            <td className="px-6 py-4 font-medium text-gray-900">{pl.name}</td>

                                            {/* LINEA ID*/}
                                            <td className="px-6 py-4 text-gray-600">{pl.id || '—'}</td>

                                            {/* VISIBILIDAD */}
                                            <td className="px-10 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={pl.is_visible}
                                                    onChange={() =>
                                                        toggleField(pl.id, "is_visible", !pl.is_visible)
                                                    }
                                                />
                                            </td>

                                            {/* ACCIONES */}
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/admin/productLines/${pl.id}`}
                                                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    Editar
                                                </Link>
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
    )
}
