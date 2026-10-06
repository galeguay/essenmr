import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
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
    const [imageVersion, setImageVersion] = useState(Date.now());
    const [pdfFile, setPdfFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [extraFiles, setExtraFiles] = useState([]);

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
        image: initialData?.image || null,
        info_pdf: initialData?.info_pdf || "",
        video_url: initialData?.video_url || "",
        images: initialData?.images || [],
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

    const loadProduct = useCallback(async () => {
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
                product_line: String(data.product_line),
                images: data.images || []
            });
        } catch (error) {
            console.error("Error cargando producto:", error);
            alert("No se pudo cargar el producto para edición.");
        }
    }, [id, isEdit]);

    useEffect(() => {
        const loadAll = async () => {
            await fetchLineas();
            await loadProduct();
        };
        loadAll();
    }, [id, loadProduct]);

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
            let pdfUrl = product.info_pdf || null;
            let videoUrl = product.video_url?.trim() || null;

            // 1. Obtener la fecha actual
            const hoy = new Date();

            // 2. Extraer Año (últimos 2), Mes (0-11, sumamos 1) y Día, asegurando 2 dígitos
            const yy = String(hoy.getFullYear()).slice(-2);
            const mm = String(hoy.getMonth() + 1).padStart(2, '0');
            const dd = String(hoy.getDate()).padStart(2, '0');

            // 3. Crear el string con el formato YYMMDD (Ej: 260306)
            const dateSuffix = `${yy}${mm}${dd}`;

            // 4. Combinar el ID de Essen con la fecha (ej: 12345_260306)
            // Agregamos un fallback a "nuevo" por si el usuario no ingresó un essen_id
            const baseId = product.essen_id || 'nuevo';

            // Si el usuario seleccionó una imagen nueva, se sube
            if (imageFile) {
                imageUrl = await uploadImage("products", imageFile, `${baseId}_${dateSuffix}`);
            }

            // Ficha / infografía en PDF (ej: 12345_ficha_260306.pdf)
            if (pdfFile) {
                pdfUrl = await uploadImage("products", pdfFile, `${baseId}_ficha_${dateSuffix}`);
            }

            // Video vertical 9:16 (ej: 12345_video_260306.mp4)
            if (videoFile) {
                videoUrl = await uploadImage("products", videoFile, `${baseId}_video_${dateSuffix}`);
            }

            // Fotos adicionales: se conservan las existentes y se suben las nuevas
            const extraUrls = [...(product.images || [])];
            for (const [i, file] of extraFiles.entries()) {
                extraUrls.push(await uploadImage("products", file, `${baseId}_extra_${dateSuffix}_${Date.now()}_${i}`));
            }

            const normalizeNumber = (value) =>
                value === "" || value === undefined || value === null
                    ? null
                    : Number(value);

            const productDataToSave = {
                ...product,
                image: imageUrl,
                info_pdf: pdfUrl,
                video_url: videoUrl,
                images: extraUrls,
                diameter: product.diameter === "" ? null : product.diameter, // Ya no se pasa por normalizeNumber
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
                    .select()
                    .single();
            } else {
                dbOperation = supabase
                    .from("products")
                    .insert(productDataToSave)
                    .select()
                    .single();
            }

            const { data, error } = await dbOperation;
            if (error) throw error;
            response = data;

            if (isEdit) {
                setImageVersion(Date.now());
                alert("Producto actualizado correctamente");
            } else {
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
                    info_pdf: "",
                    video_url: "",
                    images: [],
                });
                setExtraFiles([]);
                setPdfFile(null);
                setVideoFile(null);
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
                    autoComplete="off"
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
                    autoComplete="off"
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

            {/* Diámetro */}
            <label className="floating-label">
                <input
                    type="text" // Cambiado a text para aceptar varchar
                    name="diameter"
                    value={product.diameter}
                    onChange={handleChange}
                    className="input"
                    placeholder="Diámetro"
                    autoComplete="off"
                />
                <span>Diámetro</span>
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
                        <div className="w-48 h-48 mx-auto overflow-hidden border border-gray-200 rounded-lg shadow-sm">                            <img
                            src={`${product.image}?v=${imageVersion}`}
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

            {/* Fotos adicionales */}
            <div>
                <span className="text-sm">Fotos adicionales</span>
                {product.images?.length > 0 && (
                    <ul className="grid grid-cols-3 gap-2 my-2">
                        {product.images.map((url) => (
                            <li key={url} className="relative overflow-hidden border border-gray-200 rounded-lg aspect-square">
                                <img src={url} alt="" className="object-cover w-full h-full" />
                                <button
                                    type="button"
                                    onClick={() => setProduct(prev => ({ ...prev, images: prev.images.filter(u => u !== url) }))}
                                    className="absolute px-2 text-sm font-bold text-white bg-red-600 rounded-full top-1 right-1"
                                    aria-label="Quitar foto"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setExtraFiles(Array.from(e.target.files))}
                    className="w-full file-input file-input-md"
                />
                <div className="mt-1 text-xs text-gray-500">
                    Podés elegir varias a la vez. {extraFiles.length > 0 && `${extraFiles.length} nueva(s) para subir al guardar.`}
                </div>
            </div>

            {/* Contenido de lanzamiento: ficha PDF y video, se ven en la página del producto */}
            <fieldset className="p-4 space-y-5 border border-orange-200 rounded-lg bg-orange-50/50">
                <legend className="px-2 text-sm font-semibold text-orange-800">Contenido de lanzamiento</legend>

                {/* Ficha PDF */}
                <div>
                    <span className="block mb-1 text-sm">Ficha / infografía (PDF)</span>
                    {product.info_pdf && !pdfFile && (
                        <div className="flex items-center justify-between gap-2 mb-2 text-sm">
                            <a href={product.info_pdf} target="_blank" rel="noopener noreferrer" className="text-orange-700 underline truncate">
                                <i className="bi bi-file-earmark-pdf me-1"></i>Ver ficha actual
                            </a>
                            <button
                                type="button"
                                onClick={() => setProduct(prev => ({ ...prev, info_pdf: "" }))}
                                className="text-red-600 hover:underline shrink-0"
                            >
                                Quitar
                            </button>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setPdfFile(e.target.files[0] || null)}
                        className="w-full file-input file-input-md"
                    />
                </div>

                {/* Video 9:16 */}
                <div>
                    <span className="block mb-1 text-sm">Video (YouTube, reel o archivo, vertical u horizontal)</span>
                    <input
                        type="url"
                        name="video_url"
                        value={product.video_url || ""}
                        onChange={handleChange}
                        disabled={!!videoFile}
                        placeholder="Link de YouTube, YouTube Shorts, Instagram, TikTok o .mp4"
                        className="w-full mb-2 input"
                        autoComplete="off"
                    />
                    <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(e) => setVideoFile(e.target.files[0] || null)}
                        className="w-full file-input file-input-md"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                        Pegá un link o subí el archivo (MP4 recomendado, idealmente menos de 50 MB). Si subís un archivo, reemplaza al link.
                    </div>
                </div>
            </fieldset>

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