import { useEffect, useRef, useState } from "react";
import { getVideoSource } from "../utils/videoEmbed";

// Video estilo "reel". Los archivos propios se reproducen en silencio
// cuando están en pantalla y se pausan al salir; los links externos se embeben.
// Los verticales (Shorts, reels, TikTok) usan marco 9:16; un video común de YouTube usa 16:9.
export default function VerticalVideo({ url, title, poster }) {
    const source = getVideoSource(url);
    const frameRef = useRef(null);
    const videoRef = useRef(null);
    const [inView, setInView] = useState(false);
    const [muted, setMuted] = useState(true);
    const [embedLoaded, setEmbedLoaded] = useState(false);
    // Para archivos propios la orientación se detecta al cargar los metadatos del video
    const [fileVertical, setFileVertical] = useState(true);

    useEffect(() => {
        const el = frameRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                const visible = entry.intersectionRatio >= 0.6;
                setInView(visible);
                if (visible) setEmbedLoaded(true);
            },
            { threshold: [0, 0.6, 1] }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (inView) video.play().catch(() => {});
        else video.pause();
    }, [inView]);

    const toggleSound = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setMuted(video.muted);
        if (!video.muted) video.play().catch(() => {});
    };

    if (!source) return null;

    const vertical = source.type === "file" ? fileVertical : source.vertical;
    const frameClass = vertical
        ? "max-w-[min(360px,calc(78svh*9/16))] aspect-[9/16] border-[6px] rounded-[28px]"
        : "max-w-2xl aspect-video border-[6px] rounded-2xl";
    const innerRadius = vertical ? "rounded-[22px]" : "rounded-xl";

    return (
        <div
            ref={frameRef}
            className={`relative w-full mx-auto overflow-hidden bg-stone-900 border-stone-900 shadow-2xl ${frameClass}`}
        >
            {source.type === "file" ? (
                <>
                    <video
                        ref={videoRef}
                        src={`${source.src}#t=0.1`}
                        poster={poster || undefined}
                        className={`${vertical ? "object-cover" : "object-contain"} w-full h-full ${innerRadius}`}
                        muted
                        loop
                        playsInline
                        controls
                        preload="metadata"
                        onLoadedMetadata={(e) => setFileVertical(e.currentTarget.videoHeight >= e.currentTarget.videoWidth)}
                        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
                        aria-label={title ? `Video de ${title}` : "Video del producto"}
                    />
                    <button
                        type="button"
                        onClick={toggleSound}
                        className="absolute flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white rounded-full top-3 right-3 bg-black/55 backdrop-blur hover:bg-black/70"
                    >
                        <i className={`bi ${muted ? "bi-volume-mute-fill" : "bi-volume-up-fill"}`}></i>
                        {muted ? "Activar sonido" : "Silenciar"}
                    </button>
                </>
            ) : (
                // Los embeds se montan recién cuando el video se acerca a la pantalla
                embedLoaded ? (
                    <iframe
                        src={source.src}
                        title={title ? `Video de ${title}` : "Video del producto"}
                        className={`w-full h-full bg-black ${innerRadius}`}
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                        loading="lazy"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-white/60">
                        <i className="text-5xl bi bi-play-circle"></i>
                    </div>
                )
            )}
        </div>
    );
}
