import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

const emptyForm = {
    title: '',
    image_url: '',
    bg_color: '',
    class_name: '',
    title_class_name: '',
    title_top: false,
    starts_at: '',
    expiration_date: '',
    sort_order: 0,
    is_active: true,
};

const toDatetimeLocal = (value) => {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
};

const fromDatetimeLocal = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return date.toISOString();
};

const formatDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleString('es-AR', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
};

const getAnnouncementStatus = (announcement) => {
    const now = new Date();

    if (!announcement.is_active) {
        return {
            label: 'Inactivo',
            className: 'bg-gray-100 text-gray-700',
        };
    }

    if (announcement.starts_at && new Date(announcement.starts_at) > now) {
        return {
            label: 'Programado',
            className: 'bg-blue-100 text-blue-700',
        };
    }

    if (announcement.expiration_date && new Date(announcement.expiration_date) <= now) {
        return {
            label: 'Vencido',
            className: 'bg-red-100 text-red-700',
        };
    }

    return {
        label: 'Visible',
        className: 'bg-green-100 text-green-700',
    };
};

const buildPayload = (form) => ({
    title: form.title.trim() || null,
    image_url: form.image_url.trim(),
    bg_color: form.bg_color.trim() || null,
    class_name: form.class_name.trim() || null,
    title_class_name: form.title_class_name.trim() || null,
    title_top: Boolean(form.title_top),
    starts_at: fromDatetimeLocal(form.starts_at),
    expiration_date: fromDatetimeLocal(form.expiration_date),
    sort_order: Number(form.sort_order) || 0,
    is_active: Boolean(form.is_active),
});

const validateForm = (form) => {
    if (!form.image_url.trim()) {
        return 'La imagen del anuncio es obligatoria.';
    }

    if (form.starts_at && form.expiration_date) {
        const startsAt = new Date(form.starts_at);
        const expirationDate = new Date(form.expiration_date);

        if (expirationDate <= startsAt) {
            return 'La fecha "Visible hasta" debe ser posterior a "Visible desde".';
        }
    }

    return null;
};

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [form, setForm] = useState({ ...emptyForm });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const isEditing = Boolean(editingId);

    const sortedAnnouncements = useMemo(() => {
        return [...announcements].sort((a, b) => {
            const sortDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0);

            if (sortDiff !== 0) return sortDiff;

            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        });
    }, [announcements]);

    const fetchAnnouncements = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage('');

            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) throw error;

            setAnnouncements(data || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            setErrorMessage(`Error al cargar los anuncios: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: type === 'checkbox' ? checked : value,
        }));

        setErrorMessage('');
        setSuccessMessage('');
    };

    const resetForm = () => {
        setForm({ ...emptyForm });
        setEditingId(null);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm(form);

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        try {
            setSaving(true);
            setErrorMessage('');
            setSuccessMessage('');

            const payload = buildPayload(form);

            if (editingId) {
                const { error } = await supabase
                    .from('announcements')
                    .update(payload)
                    .eq('id', editingId);

                if (error) throw error;

                setSuccessMessage('Anuncio actualizado correctamente.');
            } else {
                const { error } = await supabase
                    .from('announcements')
                    .insert(payload);

                if (error) throw error;

                setSuccessMessage('Anuncio creado correctamente.');
            }

            resetForm();
            await fetchAnnouncements();
        } catch (error) {
            console.error('Error saving announcement:', error);
            setErrorMessage(`Error al guardar el anuncio: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (announcement) => {
        setEditingId(announcement.id);
        setErrorMessage('');
        setSuccessMessage('');

        setForm({
            title: announcement.title || '',
            image_url: announcement.image_url || '',
            bg_color: announcement.bg_color || '',
            class_name: announcement.class_name || '',
            title_class_name: announcement.title_class_name || '',
            title_top: Boolean(announcement.title_top),
            starts_at: toDatetimeLocal(announcement.starts_at),
            expiration_date: toDatetimeLocal(announcement.expiration_date),
            sort_order: announcement.sort_order ?? 0,
            is_active: Boolean(announcement.is_active),
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (announcement) => {
        const confirmed = window.confirm(
            `¿Seguro que querés borrar el anuncio "${announcement.title || 'Sin título'}"?`
        );

        if (!confirmed) return;

        try {
            setErrorMessage('');
            setSuccessMessage('');

            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', announcement.id);

            if (error) throw error;

            if (editingId === announcement.id) {
                resetForm();
            }

            setSuccessMessage('Anuncio borrado correctamente.');
            await fetchAnnouncements();
        } catch (error) {
            console.error('Error deleting announcement:', error);
            setErrorMessage(`Error al borrar el anuncio: ${error.message}`);
        }
    };

    const handleToggleActive = async (announcement) => {
        try {
            setErrorMessage('');
            setSuccessMessage('');

            const { error } = await supabase
                .from('announcements')
                .update({ is_active: !announcement.is_active })
                .eq('id', announcement.id);

            if (error) throw error;

            setSuccessMessage(
                announcement.is_active
                    ? 'Anuncio desactivado correctamente.'
                    : 'Anuncio activado correctamente.'
            );

            await fetchAnnouncements();
        } catch (error) {
            console.error('Error updating announcement:', error);
            setErrorMessage(`Error al actualizar el anuncio: ${error.message}`);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    Anuncios
                </h1>

                <p className="mt-1 text-gray-600">
                    Desde acá podés crear, editar, ordenar y desactivar los anuncios que aparecen en el inicio.
                </p>
            </div>

            {errorMessage ? (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            ) : null}

            {successMessage ? (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {successMessage}
                </div>
            ) : null}

            <form
                onSubmit={handleSubmit}
                className="mb-10 rounded-xl border bg-white p-6 shadow-sm"
            >
                <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">
                            {isEditing ? 'Editar anuncio' : 'Nuevo anuncio'}
                        </h2>

                        <p className="text-sm text-gray-500">
                            Los campos de clases son opcionales y sirven para ajustar estilos puntuales.
                        </p>
                    </div>

                    {isEditing ? (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                        >
                            Cancelar edición
                        </button>
                    ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label htmlFor="title" className="mb-1 block text-sm font-medium">
                            Título
                        </label>

                        <input
                            id="title"
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                            placeholder="Ej: Promo especial del Día del Padre"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="image_url" className="mb-1 block text-sm font-medium">
                            URL de imagen *
                        </label>

                        <input
                            id="image_url"
                            type="url"
                            name="image_url"
                            value={form.image_url}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                            placeholder="https://..."
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="bg_color" className="mb-1 block text-sm font-medium">
                            Color de fondo
                        </label>

                        <input
                            id="bg_color"
                            type="text"
                            name="bg_color"
                            value={form.bg_color}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                            placeholder="#050810"
                        />
                    </div>

                    <div>
                        <label htmlFor="sort_order" className="mb-1 block text-sm font-medium">
                            Orden
                        </label>

                        <input
                            id="sort_order"
                            type="number"
                            name="sort_order"
                            value={form.sort_order}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label htmlFor="starts_at" className="mb-1 block text-sm font-medium">
                            Visible desde
                        </label>

                        <input
                            id="starts_at"
                            type="datetime-local"
                            name="starts_at"
                            value={form.starts_at}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label htmlFor="expiration_date" className="mb-1 block text-sm font-medium">
                            Visible hasta
                        </label>

                        <input
                            id="expiration_date"
                            type="datetime-local"
                            name="expiration_date"
                            value={form.expiration_date}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label htmlFor="class_name" className="mb-1 block text-sm font-medium">
                            Clases del anuncio
                        </label>

                        <input
                            id="class_name"
                            type="text"
                            name="class_name"
                            value={form.class_name}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                            placeholder="pt-9 pb-8"
                        />
                    </div>

                    <div>
                        <label htmlFor="title_class_name" className="mb-1 block text-sm font-medium">
                            Clases del título
                        </label>

                        <input
                            id="title_class_name"
                            type="text"
                            name="title_class_name"
                            value={form.title_class_name}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                            placeholder="text-white"
                        />
                    </div>

                    <label className="flex items-center gap-2 rounded-lg border px-3 py-2">
                        <input
                            type="checkbox"
                            name="title_top"
                            checked={form.title_top}
                            onChange={handleChange}
                        />

                        Mostrar título arriba
                    </label>

                    <label className="flex items-center gap-2 rounded-lg border px-3 py-2">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={form.is_active}
                            onChange={handleChange}
                        />

                        Anuncio activo
                    </label>
                </div>

                {form.image_url ? (
                    <div className="mt-6">
                        <p className="mb-2 text-sm font-medium">
                            Vista previa de imagen
                        </p>

                        <div className="rounded-lg border bg-gray-50 p-3">
                            <img
                                src={form.image_url}
                                alt="Vista previa del anuncio"
                                className="max-h-64 w-full rounded-lg object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                ) : null}

                <div className="mt-6 flex gap-3">
                    <button
                        type="submit"
                        disabled={saving || loading}
                        className="rounded-lg bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving
                            ? 'Guardando...'
                            : isEditing
                                ? 'Guardar cambios'
                                : 'Crear anuncio'}
                    </button>
                </div>
            </form>

            <section>
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Anuncios cargados
                        </h2>

                        <p className="text-sm text-gray-500">
                            Total: {announcements.length}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchAnnouncements}
                        disabled={loading}
                        className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>

                {loading ? (
                    <div className="rounded-xl border bg-white p-6 text-gray-600">
                        Cargando anuncios...
                    </div>
                ) : sortedAnnouncements.length === 0 ? (
                    <div className="rounded-xl border bg-white p-6 text-gray-600">
                        Todavía no hay anuncios cargados.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {sortedAnnouncements.map((announcement) => {
                            const status = getAnnouncementStatus(announcement);

                            return (
                                <article
                                    key={announcement.id}
                                    className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm md:flex-row md:items-center"
                                >
                                    <div className="h-32 w-full overflow-hidden rounded-lg border bg-gray-50 md:w-52">
                                        <img
                                            src={announcement.image_url}
                                            alt={announcement.title || 'Anuncio'}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                            <h2 className="font-semibold">
                                                {announcement.title || 'Sin título'}
                                            </h2>

                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${status.className}`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="grid gap-1 text-sm text-gray-600 md:grid-cols-2">
                                            <p>
                                                Orden: {announcement.sort_order ?? 0}
                                            </p>

                                            {announcement.starts_at ? (
                                                <p>
                                                    Desde: {formatDate(announcement.starts_at)}
                                                </p>
                                            ) : (
                                                <p>
                                                    Desde: inmediato
                                                </p>
                                            )}

                                            {announcement.expiration_date ? (
                                                <p>
                                                    Hasta: {formatDate(announcement.expiration_date)}
                                                </p>
                                            ) : (
                                                <p>
                                                    Hasta: sin vencimiento
                                                </p>
                                            )}

                                            {announcement.bg_color ? (
                                                <p>
                                                    Fondo: {announcement.bg_color}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 md:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(announcement)}
                                            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                                        >
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleToggleActive(announcement)}
                                            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                                        >
                                            {announcement.is_active ? 'Desactivar' : 'Activar'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(announcement)}
                                            className="rounded-lg border border-red-500 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            Borrar
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}