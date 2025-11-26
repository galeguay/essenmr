import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pb } from '../../lib/pocketbase';

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
            const filters = search ? `name ~ "%${search}%"` : '';
            
            const result = await pb.collection('product_lines').getList(page, perPage, {
            sort: '-created',
            filter: filters,
            });

            setProductLines(result.items);
            setTotalPages(Math.ceil(result.totalItems / perPage));
        } catch (err) {
            console.error(err);
            alert('Error al cargar las lineas de productos');
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

    return(
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
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {productLines.map((l) => (
                        <tr key={l.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4">
                            {l.image ? (
                                <img
                                src={`${pb.baseUrl}/api/files/product_lines/${l.id}/${l.image}?thumb=100x100`}
                                alt={l.name}
                                className="w-12 h-12 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-gray-200 border-2 border-dashed rounded-lg"></div>
                            )}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">{l.name}</td>
                            <td className="px-6 py-4 text-gray-600">{l.id || '—'}</td>
                            <td className="px-6 py-4">
                            <Link
                                to={`/admin/product_lines/${l.id}`}
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
