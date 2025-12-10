import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from '../../lib/supabase';
import { uploadImage } from "../../utils/uploadImage";

export default function ProductForm({
    initialData = null,
    onSubmit = (data) => console.log(data),
    onCancel = null
}) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [imageFile, setImageFile] = useState(null);

    const [product, setProduct] = useState({
        name: initialData?.name || "",
        essen_id: initialData?.essen_id || "",
        product_line: initialData?.product_line || "",
        description: initialData?.description || "", // <-- ¡Aquí está!
        diameter: initialData?.diameter || "",
        capacity: initialData?.capacity || "",
        is_visible: initialData?.is_visible ?? false,
        is_new: initialData?.is_new ?? false,
        discount: initialData?.discount || "",
        image: initialData?.image || null, // Aseguramos el campo de imagen para edición
    });

    const [lineas, setLineas] = useState([]);
    const [loadingLineas, setLoadingLineas] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchLineas = async () => {
        try {
            const { data, error } = await supabase
                .from("product_lines")
                .select("*")
                .order("name", { ascending: true });

            if (error) throw error;

            setLineas(data);
        } catch (error) {
            console.error("Error cargando líneas:", error);
            alert("No se pudieron cargar las líneas de productos");
        } finally {
            setLoadingLineas(false);
        }
    };

    const loadProduct = async () => {
        if (!isEdit) return;

        try {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;

            setProduct({
                ...data,
                // Aseguramos que sea string para que coincida con el <select>
                product_line: String(data.product_line)
            });
        } catch (error) {
            console.error("Error cargando producto:", error);
            alert("No se pudo cargar el producto para edición.");
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            await fetchLineas();
            await loadProduct();
        };
        loadAll();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = product.image || null;

            // Si el usuario seleccionó una imagen nueva, se sube
            if (imageFile) {
                // Usamos el id Essen para nombrar la imagen
                imageUrl = await uploadImage("products", imageFile, product.essen_id); 
            }
            const normalizeNumber = (value) =>
                value === "" || value === undefined || value === null
                    ? null
                    : Number(value);

            const productDataToSave = {
                ...product,
                image: imageUrl,
                diameter: normalizeNumber(product.diameter),
                capacity: normalizeNumber(product.capacity),
                discount: normalizeNumber(product.discount),
                product_line: normalizeNumber(product.product_line),
                essen_id: normalizeNumber(product.essen_id),
            };

            let response;
            let dbOperation;

            if (isEdit) {
                dbOperation = supabase
                    .from("products")
                    .update(productDataToSave)
                    .eq("id", id)
                    .select() // Agregamos select() para obtener el registro actualizado
                    .single();
            } else {
                dbOperation = supabase
                    .from("products")
                    .insert(productDataToSave)
                    .select() // Agregamos select() para obtener el registro insertado
                    .single();
            }
            
            const { data, error } = await dbOperation;

            if (error) throw error;
            
            response = data;
            
            if (isEdit) {
                 alert("Producto actualizado correctamente");
            } else {
                 // Limpiar estado en inserción
                 setProduct({
                    name: "",
                    essen_id: "",
                    product_line: "",
                    description: "",
                    diameter: "",
                    capacity: "",
                    is_visible: false,
                    is_new: false,
                    discount: "",
                    image: null,
                 });
            }

            navigate("/admin/products");
            onSubmit(response);

        } catch (error) {
            console.error("Error guardando producto:", error);
            alert("Error: " + (error.message || "Error desconocido al guardar"));

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
                {isEdit ? "Editar producto" : "Registrar nuevo producto"}
            </h2>

            {/* Nombre */}
            <label className="floating-label">
                <input
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="Nombre"
                    autocomplete="off"
                />
                <span>Nombre *</span>
            </label>

            {/* Código Essen */}
            <label className="floating-label">
                <input
                    type="text"
                    name="essen_id"
                    value={product.essen_id}
                    onChange={handleChange}
                    className="input"
                    placeholder="Código Essen"
                    autocomplete="off"
                />
                <span>Código Essen</span>
            </label>

            {/* Línea de producto */}
            <label className="select">
                <span className="label">Línea</span>
                <select
                    name="product_line"
                    value={product.product_line}
                    onChange={handleChange}
                    required
                    disabled={loadingLineas}
                >
                    <option value="">{loadingLineas ? "Cargando..." : "Seleccionar línea..."}</option>
                    {lineas.map(linea => (
                        <option key={linea.id} value={linea.id}>
                            {linea.name}
                        </option>
                    ))}
                </select>
            </label>

            {/* Diámetro (cm) */}
            <label className="floating-label">
                <input
                    type="number"
                    name="diameter"
                    value={product.diameter}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    className="input"
                    placeholder="Diámetro (cm)"
                />
                <span>Diámetro (cm)</span>
            </label>

            {/* Capacidad (L) */}
            <div>
                <label className="floating-label">
                    <input
                        type="number"
                        name="capacity"
                        value={product.capacity}
                        onChange={handleChange}
                        step="0.1"
                        min="0"
                        className="input"
                        placeholder="Capacidad (L)"
                    />
                    <span>Capacidad (L)</span>
                </label>
                <div className="mt-1 text-xs text-gray-500">El valor decimal se debe ingresar con punto (Ej: 4.2)</div>
            </div>

            {/* 🛑 DESCRIPCIÓN 🛑 */}
            <label className="block">
                <span className="block mb-1 text-sm text-gray-600">Descripción (opcional)</span>
                <textarea
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Detalles, materiales, y características del producto..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </label>

            {/* Switch: Visible */}
            <div className="flex items-center justify-between w-[50%]">
                <span className="text-sm me-1">Visible en el catálogo</span>
                <input
                    type="checkbox"
                    name="is_visible"
                    checked={product.is_visible}
                    onChange={handleChange}
                    className="toggle toggle-success"
                />
            </div>

            {/* Switch: Es nuevo */}
            <div className="flex items-center justify-between w-[50%]">
                <span className="text-sm me-1">¿Es producto nuevo?</span>
                <input
                    type="checkbox"
                    name="is_new"
                    checked={product.is_new}
                    onChange={handleChange}
                    className="toggle toggle-success"
                />
            </div>

            {/* Descuento */}
            <label className="mb-6 floating-label">
                <input
                    type="number"
                    name="discount"
                    value={product.discount}
                    onChange={handleChange}
                    min="0"
                    max="90"
                    placeholder="Descuento (%)"
                    className="input"
                />
                 <span>Descuento (%)</span>
            </label>

            {/* Cargar imagen */}
            <div>
                <span className="text-sm">Imagen</span>
                {isEdit && product.image && !imageFile && (
                    <div className="mb-2">
                        {/* Contenedor que define el espacio cuadrado */}
                        <div className="w-48 h-48 mx-auto overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                            <img
                                src={product.image}
                                alt={`Imagen de ${product.name}`}
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
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 font-bold text-white transition bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-70"
                >
                    {loading ? "Guardando..." : isEdit ? "Actualizar" : "Guardar producto"}
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