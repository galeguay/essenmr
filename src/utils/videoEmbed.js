// Detecta de dónde viene un video y devuelve cómo mostrarlo.
// Soporta archivos directos (mp4/webm/mov subidos a Supabase), YouTube (incluye Shorts),
// Instagram (reels/posts) y TikTok. `vertical` indica si el video es 9:16 o horizontal 16:9.
export function getVideoSource(url) {
    if (!url) return null;

    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        return { type: "file", vertical: true, src: url };
    }

    const host = parsed.hostname.replace(/^www\.|^m\./, "");

    if (host === "youtu.be" || host.endsWith("youtube.com")) {
        let id = null;
        if (host === "youtu.be") id = parsed.pathname.slice(1);
        else if (parsed.pathname.startsWith("/shorts/")) id = parsed.pathname.split("/")[2];
        else if (parsed.pathname.startsWith("/embed/")) id = parsed.pathname.split("/")[2];
        else id = parsed.searchParams.get("v");

        if (id) {
            return {
                type: "embed",
                vertical: parsed.pathname.startsWith("/shorts/"),
                src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&modestbranding=1`,
            };
        }
    }

    if (host === "instagram.com") {
        const match = parsed.pathname.match(/^\/(reel|reels|p|tv)\/([^/]+)/);
        if (match) {
            const kind = match[1] === "reels" ? "reel" : match[1];
            return { type: "embed", vertical: true, src: `https://www.instagram.com/${kind}/${match[2]}/embed` };
        }
    }

    if (host === "tiktok.com") {
        const match = parsed.pathname.match(/\/video\/(\d+)/);
        if (match) return { type: "embed", vertical: true, src: `https://www.tiktok.com/embed/v2/${match[1]}` };
    }

    return { type: "file", vertical: true, src: url };
}
