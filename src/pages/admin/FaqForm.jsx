import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function FaqPage() {
  // FORM
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // LISTA
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  // EDICIÓN
  const [editingId, setEditingId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("id", { ascending: true });

    if (!error) setFaqs(data);
    setLoadingFaqs(false);
  };

  // CREAR
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const { data, error } = await supabase
      .from("faqs")
      .insert([{ question, answer }])
      .select();

    if (error) {
      setMsg("Error guardando.");
    } else {
      setMsg("FAQ guardada ✔️");
      setQuestion("");
      setAnswer("");
      setFaqs((prev) => [...prev, data[0]]);
    }

    setLoading(false);
  };

  // ELIMINAR
  const deleteFaq = async (id) => {
    const ok = confirm("¿Seguro que querés eliminar esta FAQ?");
    if (!ok) return;

    const { error } = await supabase.from("faqs").delete().eq("id", id);

    if (!error) {
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } else {
      alert("No se pudo eliminar.");
    }
  };

  // ENTRAR EN MODO EDICIÓN
  const startEdit = (faq) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  // CANCELAR EDICIÓN
  const cancelEdit = () => {
    setEditingId(null);
    setEditQuestion("");
    setEditAnswer("");
  };

  // GUARDAR EDICIÓN
  const saveEdit = async (id) => {
    const { data, error } = await supabase
      .from("faqs")
      .update({
        question: editQuestion,
        answer: editAnswer,
      })
      .eq("id", id)
      .select();

    if (!error) {
      // actualizar la lista en memoria
      setFaqs((prev) =>
        prev.map((f) => (f.id === id ? data[0] : f))
      );
      cancelEdit();
    } else {
      alert("No se pudo actualizar.");
    }
  };

  return (
    <div className="max-w-3xl p-6 mx-auto space-y-10">
      {/* FORMULARIO */}
      <form
        onSubmit={handleSubmit}
        className="p-4 space-y-4 rounded-lg shadow bg-base-200"
      >
        <h2 className="text-2xl font-bold">Cargar nueva FAQ</h2>

        <div>
          <label className="label">
            <span className="label-text">Pregunta</span>
          </label>
          <input
            type="text"
            className="w-full input input-bordered"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Respuesta</span>
          </label>
          <textarea
            className="w-full textarea textarea-bordered"
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full btn btn-primary"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar FAQ"}
        </button>

        {msg && <p className="mt-2 text-center">{msg}</p>}
      </form>

      {/* LISTA */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">FAQs guardadas</h2>

        {loadingFaqs ? (
          <p>Cargando preguntas...</p>
        ) : faqs.length === 0 ? (
          <p>No hay FAQs cargadas.</p>
        ) : (
          <div className="space-y-3">
            {faqs.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg shadow bg-base-200"
              >
                {/* MODO EDICIÓN */}
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <input
                      className="w-full input input-bordered"
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                    />

                    <textarea
                      className="w-full textarea textarea-bordered"
                      rows={3}
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Guardar
                      </button>

                      <button
                        onClick={cancelEdit}
                        className="btn btn-ghost btn-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* MODO NORMAL */
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{item.question}</h3>
                      <p className="text-sm opacity-80">{item.answer}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="btn btn-sm"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => deleteFaq(item.id)}
                        className="btn btn-error btn-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
