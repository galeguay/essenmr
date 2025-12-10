import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Text from '../../components/public/Text';

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
                .select("*", { count: "exact" })
                .order("created_at", { ascending: false });

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
        <div className="p-6 mx-auto max-w-7xl">
            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-bold text-gray-800">Líneas de productos</h1>
                <Link
                    to="/admin/productLines/new"
                    className="px-6 py-3 font-medium text-white transition bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700"
                >
                    + Nueva Línea
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
                    <div className="w-12 h-12 border-b-4 border-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {/* Tabla */}
                    <div className="overflow-hidden bg-white shadow-lg rounded-xl">
                        <div className="overflow-x-auto">
                            {/* Ajustamos la tabla para centrar el contenido estéticamente */}
                            <table className="w-full text-center"> 
                                <thead className="text-center text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        {/* Centrar encabezados */}
                                        <th className="px-3 py-2 font-medium tracking-wider"><Text> Imagen </Text></th>
                                        <th className="px-3 py-2 font-medium tracking-wider"><Text> Nombre </Text></th>
                                        <th className="px-3 py-2 font-medium tracking-wider"><Text> ID </Text></th>
                                        {/* 💡 NUEVA COLUMNA DE COLOR */}
                                        <th className="px-3 py-2 font-medium tracking-wider"><Text> Color </Text></th>
                                        <th className="px-3 py-2 font-medium tracking-wider"><Text> Visible </Text></th>
                                        <th className="px-3 py-2 font-medium tracking-wider"><Text> Acciones </Text></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {productLines.map((pl) => (
                                        <tr key={pl.id} className="transition hover:bg-gray-50">
                                            {/* Imagen */}
                                            <td className="px-3 py-2">
                                                <div className="flex justify-center">
                                                    {pl.image ? (
                                                        <img
                                                            src={pl.image}
                                                            alt={pl.name}
                                                            className="object-cover w-12 h-12 rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 border-2 border-dashed rounded-md"></div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* NOMBRE */}
                                            <td className="px-3 py-2"><Text>{pl.name}</Text></td>

                                            {/* LINEA ID*/}
                                            <td className="px-3 py-2 text-gray-600">{pl.id || '—'}</td>

                                            {/* 💡 CELDA DEL COLOR (Círculo + Código) */}
                                            <td className="px-3 py-2">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Círculo de color */}
                                                    <div
                                                        className="w-4 h-4 border border-gray-300 rounded-full shadow-sm"
                                                        style={{ backgroundColor: pl.color || '#F0F0F0' }} // Usa el color o un gris por defecto
                                                        title={`Color: ${pl.color || 'No definido'}`}
                                                    ></div>
                                                    {/* Código Hexadecimal */}
                                                    <Text>
                                                        {pl.color || '—'}
                                                    </Text>
                                                </div>
                                            </td>

                                            {/* VISIBILIDAD (Usando Toggle de DaisyUI para estética similar a Products) */}
                                            <td className="px-3 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={pl.is_visible}
                                                    onChange={() =>
                                                        toggleField(pl.id, "is_visible", !pl.is_visible)
                                                    }
                                                    className="toggle toggle-success"
                                                />
                                            </td>

                                            {/* ACCIONES */}
                                            <td className="px-3 py-2">
                                                <Link
                                                    to={`/admin/productLines/${pl.id}`}
                                                    className="font-medium text-indigo-600 hover:text-indigo-800"
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