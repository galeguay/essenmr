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
        description: initialData?.description || "",
        diameter: initialData?.diameter || "",
        capacity: initialData?.capacity || "",
        is_visible: initialData?.is_visible ?? false,
        is_new: initialData?.is_new ?? false,
        discount: initialData?.discount || "",
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

    // En loadProduct
    const loadProduct = async () => {
        if (!isEdit) return;

        try {
            // ... (código de carga)
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("id", id)
                .single();
            // ...

            setProduct({
                ...data,
                // Aseguramos que sea string para que coincida con el <select>
                product_line: String(data.product_line)
            });
        } catch (error) {
            // ...
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

            if (isEdit) {
                const { data, error } = await supabase
                    .from("products")
                    .update(productDataToSave)
                    .eq("id", id)
                    .single();

                if (error) throw error;

                alert("Producto actualizado correctamente");
                navigate("/admin/products");
                response = data;

            } else {
                const { data, error } = await supabase
                    .from("products")
                    .insert(productDataToSave)
                    .single();

                if (error) throw error;

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
                });

                navigate("/admin/products");
            }

            onSubmit(response);

        } catch (error) {
            console.error("Error guardando producto:", error);
            alert("Error: " + error.message);

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
                <span>Código Essen</span>
                <input
                    type="text"
                    name="essen_id"
                    value={product.essen_id}
                    onChange={handleChange}
                    className="input"
                    placeholder="Código Essen"
                    autocomplete="off"
                />
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
                        <option key={linea.id} value={linea.id}> {/* <-- ¡CAMBIO AQUÍ! Usar linea.id */}
                            {linea.name}
                        </option>
                    ))}
                </select>
            </label>

            {/* Diámetro y Capacidad */}
            <label className="floating-label">
                <span className="label">Diámetro (cm)</span>
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
            </label>

            {/* Capacidad */}
            <div>
                <label className="floating-label">
                    <span>Capacidad (L)</span>
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
                </label>
                <div className="mt-1 text-xs text-gray-500">El valor decimal se debe ingresar con punto (Ej: 4.2)</div>
            </div>

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
                <span>Descuento (%)</span>
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
                                className="object-cover w-full h-full" // La imagen cubre completamente el contenedor 1:1
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