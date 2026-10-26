const MAX_DIGITS = 15;

// Recorta espacios y, si es numérico, quita los ceros a la izquierda ("00123" → "123").
export function normalizeProductCode(raw) {
    const value = String(raw ?? "").trim();
    if (!/^\d+$/.test(value)) return value;
    return value.replace(/^0+(?=\d)/, "");
}

// Devuelve el mensaje de error, o "" si el formato es válido.
export function validateProductCodeFormat(raw) {
    const value = String(raw ?? "").trim();
    if (value === "") return "El código es obligatorio.";
    if (!/^\d+$/.test(value)) return "El código solo puede contener números.";
    if (normalizeProductCode(value).length > MAX_DIGITS) {
        return `El código no puede tener más de ${MAX_DIGITS} dígitos.`;
    }
    return "";
}
