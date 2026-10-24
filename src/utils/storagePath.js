// Devuelve la ruta del archivo dentro del bucket de Storage, o null si la URL
// no es un archivo público de este proyecto (vacía, inválida, externa o de otro bucket).
export function storagePathFromUrl(url, bucket) {
    if (!url || typeof url !== "string") return null;

    const marker = `/storage/v1/object/public/${bucket}/`;

    try {
        const parsed = new URL(url);
        const projectOrigin = new URL(import.meta.env.VITE_SUPABASE_URL).origin;
        if (parsed.origin !== projectOrigin) return null;

        const index = parsed.pathname.indexOf(marker);
        if (index !== 0) return null;

        const path = decodeURIComponent(parsed.pathname.slice(marker.length));
        return path || null;
    } catch {
        return null;
    }
}
