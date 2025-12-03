import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from '../../lib/supabase';

export default function ProductLineForm({
    initialData = null,
    onSubmit = (data) => console.log(data),
    onCancel = null
}) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [form, setForm] = useState({
        name: initialData?.name || "",
        string_id: initialData?.string_id || "",
        color: initialData?.color || "#8b5cf6",
        is_visible: initialData ? initialData.is_visible !== false : true,
        description: initialData?.description || "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadProductLine = async () => {
            if (!isEdit) return;

            try {
                const { data, error } = await supabase
                    .from("product_lines")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;

                setForm(data);
            } catch (error) {
                alert("No se pudo cargar la línea");
                navigate("/admin/productLines");
            }
        };
        loadProductLine();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let newValue = type === "checkbox" ? checked : value;

        /* CAMPO STRING ID SIEMPRE EN MINUSCULAS */
        if (name === "string_id") {
            newValue = newValue.toLowerCase();
        }

        setForm(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let response;
            if (isEdit) {
                const { data, error } = await supabase
                    .from("product_lines")
                    .update(form)
                    .eq("id", id)
                    .single();

                if (error) throw error;

                alert("Línea actualizada correctamente");
                navigate("/admin/productLines");
                response = data;
            } else {
                const { data, error } = await supabase
                    .from("product_lines")
                    .insert(form)
                    .single();

                if (error) throw error;

                setForm({
                    name: "",
                    string_id: "",
                    color: "#8b5cf6",
                    is_visible: true,
                    description: "",
                });
                navigate("/admin/productLines");
            }
            onSubmit(response);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al guardar: " + (error.message || "Inténtalo de nuevo"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-200"
        >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
                {isEdit ? "Editar línea de productos" : "Crear nueva línea"}
            </h2>

            {/* Nombre */}
            <label className="block mb-4">
                <span className="text-gray-700 font-medium">Nombre de la línea</span>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Clásica, Colors, Disney..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </label>

            {/* String ID */}
            <label className="block mb-4">
                <span className="text-gray-700 font-medium">String ID</span>
                <input
                    type="text"
                    name="string_id"
                    value={form.string_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </label>

            {/* Color */}
            <label className="block mb-4">
                <span className="text-gray-700 font-medium">Color representativo</span>
                <div className="flex gap-3 mt-1">
                    <input
                        type="color"
                        name="color"
                        value={form.color}
                        onChange={handleChange}
                        className="h-12 w-24 border rounded cursor-pointer"
                    />
                    <input
                        type="text"
                        value={form.color}
                        readOnly
                        className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
                    />
                </div>
            </label>

            {/* Switch: Visible */}
            <div className="flex items-center justify-between mb-5">
                <span className="text-gray-700 font-medium">Linea visible en el catálogo</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        name="is_visible"
                        checked={form.is_visible}
                        onChange={handleChange}
                        className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
            </div>

            {/* Descripción */}
            <label className="block mb-6">
                <span className="text-gray-700 font-medium">Descripción (opcional)</span>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Información adicional sobre esta línea..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </label>

            {/* Botones */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-70 transition"
                >
                    {loading ? "Guardando..." : isEdit ? "Actualizar línea" : "Crear línea"}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}