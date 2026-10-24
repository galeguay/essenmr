export const DELETE_PHRASE = "eliminar producto";

// Ignora mayúsculas/minúsculas y espacios al inicio y al final; no tolera otras diferencias.
export function isDeletePhraseValid(text) {
    return String(text ?? "").trim().toLowerCase() === DELETE_PHRASE;
}
