/* Deriva una paleta completa a partir del color representativo de una línea */

const FALLBACK = "#8b5cf6";

function hexToRgb(hex) {
    const h = /^#([0-9a-f]{6})$/i.test(hex) ? hex.slice(1) : FALLBACK.slice(1);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function rgbToHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;
    if (d === 0) return [0, 0, l];
    const s = d / (1 - Math.abs(2 * l - 1));
    let h;
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return [(h * 60 + 360) % 360, s, l];
}

const hsl = (h, s, l) => `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;

function luminance([r, g, b]) {
    const f = (c) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/* Devuelve variables CSS para aplicar con style={...} */
export function getLinePalette(color) {
    const rgb = hexToRgb(color);
    const [h, s0] = rgbToHsl(rgb);
    const s = Math.min(Math.max(s0, 0.25), 0.85);
    const base = hsl(h, s, 0.45);
    const accent = color && /^#[0-9a-f]{6}$/i.test(color) ? color : FALLBACK;

    return {
        "--line-accent": accent,
        "--line-on-accent": luminance(rgb) > 0.4 ? "#1c1917" : "#ffffff",
        "--line-dark": hsl(h, s, 0.14),
        "--line-deep": hsl(h, s, 0.24),
        "--line-base": base,
        "--line-soft": hsl(h, Math.min(s, 0.6), 0.9),
        "--line-tint": hsl(h, Math.min(s, 0.5), 0.97),
    };
}
