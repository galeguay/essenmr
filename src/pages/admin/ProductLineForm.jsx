import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { supabase } from '../../lib/supabase';
// ¡Importamos la utilidad de subida de imagen!
import { uploadImage } from "../../utils/uploadImage";

export default function ProductLineForm({
    initialData = null,
    onSubmit = (data) => console.log(data),
    onCancel = null
}) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [imageFile, setImageFile] = useState(null);


    const [form, setForm] = useState({
        name: initialData?.name || "",
        string_id: initialData?.string_id || "",
        color: initialData?.color || "#8b5cf6",
        is_visible: initialData ? initialData.is_visible !== false : true,
        description: initialData?.description || "",
        image: initialData?.image || null,
    });
    const [loading, setLoading] = useState(false);

    const loadProductLine = useCallback(async () => {
        if (!isEdit) return;

        try {
            const { data, error } = await supabase
                .from("product_lines")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;

            setForm(data);
        } catch {
            alert("No se pude cargar la línea de producto");
            navigate("/admin/productLines");
        }
    }, [isEdit, id, navigate]);

    useEffect(() => {
        if (isEdit) loadProductLine();
    }, [isEdit, loadProductLine]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let newValue = type === "checkbox" ? checked : value;

        /* CAMPO STRING ID SIEMPRE EN MINUSCULAS Y SIN ESPACIOS */
        if (name === "string_id") {
            newValue = value.toLowerCase().replace(/\s/g, '-');
        }

        setForm(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

const handleSubmit = async (e) => {
        e.preventDefault();

        const { data: userData } = await supabase.auth.getUser();
        console.log("USER:", userData.user);

        setLoading(true);

        try {
            let imageUrl = form.image || null;

            // Si el usuario seleccionó una imagen nueva, se sube con el formato YYMMDD
            if (imageFile) {
                const hoy = new Date();
                const yy = String(hoy.getFullYear()).slice(-2);
                const mm = String(hoy.getMonth() + 1).padStart(2, '0');
                const dd = String(hoy.getDate()).padStart(2, '0');
                
                const dateSuffix = `${yy}${mm}${dd}`;
                const baseId = form.string_id || 'nueva-linea';
                const newFileName = `${baseId}_${dateSuffix}`;

                imageUrl = await uploadImage("product_lines", imageFile, newFileName);
            }

            const productLineDataToSave = {
                ...form,
                image: imageUrl,
            };

            let response;
            let dbOperation;

            if (isEdit) {
                dbOperation = supabase
                    .from("product_lines")
                    .update(productLineDataToSave)
                    .eq("id", id)
                    .select()
                    .single();
            } else {
                dbOperation = supabase
                    .from("product_lines")
                    .insert(productLineDataToSave)
                    .select()
                    .single();
            }

            // Cambiamos 'data' a 'responseData' para evitar colisiones con el data del getUser
            const { data: responseData, error } = await dbOperation;

            if (error) throw error;

            response = responseData;

            if (isEdit) {
                alert("Línea actualizada correctamente");
            } else {
                alert("Línea creada correctamente");
            }

            // Limpiamos el formulario en caso de inserción exitosa
            if (!isEdit) {
                setForm({
                    name: responseData.name ?? "",
                    string_id: responseData.string_id ?? "",
                    color: responseData.color ?? "#8b5cf6",
                    is_visible: responseData.is_visible ?? true,
                    description: responseData.description ?? "",
                    image: responseData.image ?? null,
                });
                setImageFile(null);
            }

            navigate("/admin/productLines");
            onSubmit(response);

        } catch (error) {
            console.error("Error guardando línea:", error);
            alert("Error: " + (error.message || "Inténtalo de nuevo"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg p-8 mx-auto space-y-8 bg-white border border-gray-200 shadow-lg rounded-xl"
        >
            <h2 className="mb-8 text-2xl font-bold text-center text-gray-800">
                {isEdit ? "Editar línea de producto" : "Crear nueva línea de producto"}
            </h2>

            {/* Nombre */}
            <label className="floating-label">
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="Nombre"
                    autoComplete="off"
                />
                <span>Nombre *</span>
            </label>

            {/* String ID */}
            <label className="floating-label">
                <input
                    type="text"
                    name="string_id"
                    value={form.string_id}
                    onChange={handleChange}
                    required
                    className="lowercase input"
                    placeholder="ID Único (ej: clasica)"
                    autoComplete="off"
                />
                <span>Palabra ID</span>
            </label>
            <div className="mt-1 text-xs text-gray-500 -translate-y-6">
                En minúsculas y sin espacios. Ej: Para Bazar Premium sería bazar-premium
            </div>

            {/* Color */}
            <div className="flex flex-col justify-center gap-4">
                <label className="font-medium text-gray-700 whitespace-nowrap">Color representativo:</label>
                <div className="flex flex-1 gap-3">
                    <input
                        type="color"
                        name="color"
                        value={form.color}
                        onChange={handleChange}
                        className="w-20 h-10 p-0 border rounded cursor-pointer"
                    />
                    <input
                        type="text"
                        value={form.color}
                        readOnly
                        className="flex-1 px-3 py-2 font-mono text-sm border rounded-lg bg-gray-50"
                    />
                </div>
            </div>

            {/* Descripción */}
            <label className="block">
                <span className="block mb-1 text-sm text-gray-600">Descripción (opcional)</span>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Información adicional sobre esta línea..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </label>

            {/* Switch: Visible */}
            <div className="flex items-center justify-between w-[60%]">
                <span className="text-sm me-1">Visible en el catálogo</span>
                <input
                    type="checkbox"
                    name="is_visible"
                    checked={form.is_visible}
                    onChange={handleChange}
                    className="toggle toggle-success"
                />
            </div>

            {/* Cargar imagen */}
            <div>
                <span className="text-sm">Imagen de cabecera / ícono</span>
                {(isEdit && form.image && !imageFile) && (
                    <div className="mb-2">
                        <div className="w-full h-32 mx-auto overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                            <img
                                src={form.image}
                                alt={`Imagen de ${form.name}`}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <div className="mt-1 text-xs text-center text-gray-500">
                            Sube una nueva imagen para reemplazar la actual.
                        </div>
                    </div>
                )}

                <fieldset className="fieldset">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="w-full file-input file-input-md"
                    />
                </fieldset>
            </div>


            {/* Botones */}
            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 font-bold text-white transition bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-70"
                >
                    {loading ? "Guardando..." : isEdit ? "Actualizar línea" : "Crear línea"}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 font-medium text-gray-700 transition bg-gray-300 rounded-lg hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}