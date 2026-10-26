// Devuelve la URL si usa un esquema seguro (http, https, mailto, tel) o es una ruta relativa; si no, null.
// Las URLs cargadas desde el panel no se confían a ciegas: esto evita esquemas como `javascript:` o `data:`.
const SAFE_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

export function safeUrl(url) {
    if (!url || typeof url !== "string") return null;
    const value = url.trim();
    if (value.startsWith("/") && !value.startsWith("//")) return value;

    try {
        return SAFE_PROTOCOLS.includes(new URL(value).protocol) ? value : null;
    } catch {
        return null;
    }
}
