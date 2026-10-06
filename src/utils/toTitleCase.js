const LOWER_WORDS = new Set(["de", "del", "la", "las", "el", "los", "y", "e", "o", "u", "con", "sin", "para", "por", "en", "a"]);

export function toTitleCase(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(/(\s+)/)
    .map((part, i, arr) => {
      if (!part.trim()) return part;
      const isFirst = arr.slice(0, i).every((p) => !p.trim());
      if (!isFirst && LOWER_WORDS.has(part)) return part;
      return part.replace(/(^|[(\-/"])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
    })
    .join("");
}
