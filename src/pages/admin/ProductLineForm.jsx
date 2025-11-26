import { useState } from "react";
import { pb } from '../../lib/pocketbase';

export default function ProductLineForm({ 
  initialData = null, 
  onSubmit = (data) => console.log(data),
  onCancel = null 
}) {
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    name: initialData?.name || "",
    string_id: initialData?.string_id || "",
    color: initialData?.color || "#8b5cf6",
    is_visible: initialData ? initialData.is_visible !== false : true,
    description: initialData?.description || "",
  });

  const [loading, setLoading] = useState(false);

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
        record = await pb.collection('product_lines').update(initialData.id, form);
        alert("Línea actualizada correctamente");
      } else {
        record = await pb.collection('product_lines').create(form);
        alert("Línea creada correctamente");
        // Limpiar formulario después de crear
        setForm({
          name: "",
          color: "#8b5cf6",
          is_visible: true,
          description: "",
        });
      }
      onSubmit(record);
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
        <span className="text-gray-700 font-medium">Nombre de la línea *</span>
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

      {/* Visible */}
      <label className="flex items-center gap-3 mb-6">
        <input
          type="checkbox"
          name="is_visible"
          checked={form.is_visible}
          onChange={handleChange}
          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
        />
        <span className="text-gray-700 font-medium">
          Línea visible en el catálogo
        </span>
      </label>

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