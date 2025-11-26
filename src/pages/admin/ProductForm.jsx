import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { pb } from '../../lib/pocketbase';

export default function ProductForm({ 
  initialData = null, 
  onSubmit = (data) => console.log(data),
  onCancel = null 
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id; 

  const [form, setForm] = useState({
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

  // Cargar líneas de productos
  useEffect(() => {
    const fetchLineas = async () => { 
      try { 
        const records = await pb.collection('product_lines').getFullList({ sort: 'name' }); setLineas(records); } catch (error) { console.error("Error cargando líneas:", error); alert("No se pudieron cargar las líneas de productos"); } finally { 
          setLoadingLineas(false); } 
      }; 

        fetchLineas();

    const loadProduct = async () => {
      if (!isEdit) return;

      try {
        const record = await pb.collection("products").getOne(id);
        setForm({
          name: record.name,
          essen_id: record.essen_id,
          product_line: record.product_line,
          description: record.description,
          diameter: record.diameter,
          capacity: record.capacity,
          is_visible: record.is_visible,
          is_new: record.is_new,
          discount: record.discount,
        });
      } catch (error) {
        alert("No se pudo cargar el producto");
        navigate("/admin/products");
      }
    };

    loadProduct();
  }, [id]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let record;
      if (isEdit) {
        record = await pb.collection('products').update(id, form);
        alert("Producto actualizado correctamente");

        navigate("/admin/products");

      } else {
        record = await pb.collection('products').create(form);
        const seguir = confirm("Producto creado.\n¿Deseás agregar otro producto?");

          if (seguir) {
            // Resetear formulario
            setForm({
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
          } else {
            navigate("/admin/products");
          }
      }
      onSubmit(record);
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert("Error: " + (error.message || "No se pudo guardar"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200"
    >
      <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
        {isEdit ? "Editar producto" : "Registrar nuevo producto"}
      </h2>

      {/* Nombre */}
      <div className="mb-5">
        <label className="block text-gray-700 font-medium">Nombre *</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Ej: Sartén 28 cm"
        />
      </div>

      {/* Código Essen */}
      <div className="mb-5">
        <label className="block text-gray-700 font-medium">Código Essen</label>
        <input
          type="text"
          name="essen_id"
          value={form.essen_id}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border rounded-lg"
          placeholder="Ej: E280"
        />
      </div>

      {/* Línea de producto */}
      <div className="mb-5">
        <label className="block text-gray-700 font-medium">Línea *</label>
        <select
          name="product_line"
          value={form.product_line}
          onChange={handleChange}
          required
          disabled={loadingLineas}
          className="mt-1 w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
        >
          <option value="">{loadingLineas ? "Cargando..." : "Seleccionar línea..."}</option>
          {lineas.map(linea => (
            <option key={linea.id} value={linea.id}>
              {linea.name}
            </option>
          ))}
        </select>
      </div>

      {/* Diámetro y Capacidad */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-gray-700 font-medium">Diámetro (cm)</label>
          <input
            type="number"
            name="diameter"
            value={form.diameter}
            onChange={handleChange}
            step="0.1"
            min="0"
            className="mt-1 w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Capacidad (L)</label>
          <input
            type="number"
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            step="0.1"
            min="0"
            className="mt-1 w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Switch: Visible */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-gray-700 font-medium">Visible en el catálogo</span>
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

      {/* Switch: Es nuevo */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-700 font-medium">¿Es producto nuevo?</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="is_new"
            checked={form.is_new}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        </label>
      </div>

      {/* Descuento */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium">Descuento (%)</label>
        <input
          type="number"
          name="discount"
          value={form.discount}
          onChange={handleChange}
          min="0"
          max="90"
          placeholder="0"
          className="mt-1 w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-70 transition"
        >
          {loading ? "Guardando..." : isEdit ? "Actualizar" : "Guardar producto"}
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