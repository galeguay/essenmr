import { useCallback, useEffect, useRef, useState } from "react";

// pdf.js se carga solo cuando hace falta, para no sumar peso al resto del sitio
let pdfjsPromise;
function loadPdfjs() {
    if (!pdfjsPromise) {
        pdfjsPromise = Promise.all([
            import("pdfjs-dist"),
            import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
        ]).then(([pdfjs, worker]) => {
            pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
            return pdfjs;
        });
    }
    return pdfjsPromise;
}

// Límite de píxeles por canvas para no reventar la memoria en celulares
const MAX_CANVAS_PIXELS = 16_000_000;

function PdfPage({ pdf, pageNumber, width, onAspect }) {
    const canvasRef = useRef(null);
    const [aspect, setAspect] = useState(16 / 9);
    const [rendered, setRendered] = useState(false);

    useEffect(() => {
        if (!pdf || !width) return;
        let cancelled = false;
        let task;

        pdf.getPage(pageNumber)
            .then((page) => {
                if (cancelled) return;
                const base = page.getViewport({ scale: 1 });
                const pageAspect = base.width / base.height;
                setAspect(pageAspect);
                onAspect?.(pageAspect);

                const dpr = window.devicePixelRatio || 1;
                let scale = (width / base.width) * dpr;
                const pixels = base.width * scale * base.height * scale;
                if (pixels > MAX_CANVAS_PIXELS) scale *= Math.sqrt(MAX_CANVAS_PIXELS / pixels);

                const viewport = page.getViewport({ scale });
                const canvas = canvasRef.current;
                canvas.width = Math.floor(viewport.width);
                canvas.height = Math.floor(viewport.height);

                task = page.render({ canvas, canvasContext: canvas.getContext("2d"), viewport });
                return task.promise.then(() => !cancelled && setRendered(true));
            })
            .catch((err) => {
                if (err?.name !== "RenderingCancelledException") console.error("Error renderizando PDF:", err);
            });

        return () => {
            cancelled = true;
            task?.cancel();
        };
    }, [pdf, pageNumber, width, onAspect]);

    return (
        <div className="relative w-full bg-white" style={{ aspectRatio: aspect }}>
            {!rendered && <div className="absolute inset-0 animate-pulse bg-stone-100" />}
            <canvas ref={canvasRef} className="relative block w-full h-full" />
        </div>
    );
}

function useElementWidth(ref) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref]);
    return width;
}

const ZOOM_LEVELS = [1, 1.5, 2, 3];

function FullscreenViewer({ pdf, title, url, onClose }) {
    const [zoomIndex, setZoomIndex] = useState(0);
    const [aspect, setAspect] = useState(16 / 9);
    const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
        document.addEventListener("keydown", onKey);
        window.addEventListener("resize", onResize);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            window.removeEventListener("resize", onResize);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    // En celular la ficha horizontal arranca más grande que la pantalla para que el texto se lea
    const fitWidth = Math.min(viewport.w - 32, (viewport.h - 96) * aspect, 1600);
    const baseWidth = viewport.w < 768 ? Math.max(fitWidth, 900) : fitWidth;
    const width = Math.round(baseWidth * ZOOM_LEVELS[zoomIndex]);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/90" role="dialog" aria-modal="true" aria-label={`Ficha de ${title}`}>
            <div className="flex items-center gap-2 p-3 text-white">
                <p className="flex-1 hidden font-semibold truncate sm:block">{title}</p>
                <div className="flex items-center gap-1 me-auto sm:me-0">
                    <button
                        type="button"
                        onClick={() => setZoomIndex((z) => Math.max(0, z - 1))}
                        disabled={zoomIndex === 0}
                        aria-label="Alejar"
                        className="w-10 h-10 bg-white/10 hover:bg-white/20 disabled:opacity-40"
                    >
                        <i className="bi bi-zoom-out"></i>
                    </button>
                    <span className="w-14 text-sm text-center tabular-nums">{Math.round(ZOOM_LEVELS[zoomIndex] * 100)}%</span>
                    <button
                        type="button"
                        onClick={() => setZoomIndex((z) => Math.min(ZOOM_LEVELS.length - 1, z + 1))}
                        disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                        aria-label="Acercar"
                        className="w-10 h-10 bg-white/10 hover:bg-white/20 disabled:opacity-40"
                    >
                        <i className="bi bi-zoom-in"></i>
                    </button>
                </div>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    aria-label="Descargar PDF"
                    className="flex items-center h-10 px-3 bg-white/10 hover:bg-white/20"
                >
                    <i className="bi bi-download"></i>
                </a>
                <button
                    type="button"
                    onClick={onClose}
                    className="h-10 px-4 font-bold text-white bg-orange-600 hover:bg-orange-700"
                >
                    <i className="bi bi-x-lg me-2"></i>Cerrar
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="flex flex-col gap-4 px-4 pb-6 mx-auto" style={{ width: width + 32 }}>
                    {Array.from({ length: pdf.numPages }, (_, i) => (
                        <div key={i} className="shadow-2xl" style={{ width }}>
                            <PdfPage pdf={pdf} pageNumber={i + 1} width={width} onAspect={i === 0 ? setAspect : undefined} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Ficha técnica / infografía en PDF: se ve página por página dentro del sitio,
// se puede ampliar a pantalla completa con zoom y descargar.
export default function PdfInfographic({ url, title }) {
    const containerRef = useRef(null);
    const width = useElementWidth(containerRef);
    const [visible, setVisible] = useState(false);
    const [pdf, setPdf] = useState(null);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(1);
    const [fullscreen, setFullscreen] = useState(false);
    const touchStartX = useRef(null);
    const closeFullscreen = useCallback(() => setFullscreen(false), []);

    // No descargamos el PDF hasta que la ficha se acerca a la pantalla
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => entry.isIntersecting && setVisible(true),
            { rootMargin: "300px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visible || !url) return;
        let doc;
        let cancelled = false;

        loadPdfjs()
            .then((pdfjs) => {
                const task = pdfjs.getDocument({ url });
                doc = task;
                return task.promise;
            })
            .then((loaded) => !cancelled && setPdf(loaded))
            .catch((err) => {
                console.error("Error cargando PDF:", err);
                if (!cancelled) setError(true);
            });

        return () => {
            cancelled = true;
            doc?.destroy();
        };
    }, [visible, url]);

    const numPages = pdf?.numPages || 0;
    const goTo = (n) => setPage((p) => Math.min(Math.max(1, n ?? p), numPages || 1));

    const onTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
    const onTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 50) goTo(page + (dx < 0 ? 1 : -1));
        touchStartX.current = null;
    };

    return (
        <div className="w-full">
            <div
                ref={containerRef}
                className="relative overflow-hidden bg-white border shadow-sm border-stone-200"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                {error ? (
                    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center aspect-video text-stone-500">
                        <i className="text-4xl bi bi-file-earmark-pdf"></i>
                        <p>No pudimos mostrar la ficha acá.</p>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-orange-700 underline">
                            Abrir el PDF
                        </a>
                    </div>
                ) : pdf ? (
                    <button
                        type="button"
                        onClick={() => setFullscreen(true)}
                        className="block w-full cursor-zoom-in group"
                        aria-label={`Ampliar ficha de ${title}`}
                    >
                        <PdfPage pdf={pdf} pageNumber={page} width={width} />
                        <span className="absolute px-3 py-1 text-sm font-semibold text-white bg-orange-600 shadow bottom-3 right-3 group-hover:bg-orange-700">
                            <i className="bi bi-arrows-fullscreen me-1.5"></i>Ampliar
                        </span>
                    </button>
                ) : (
                    <div className="aspect-video animate-pulse bg-stone-100" />
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                {numPages > 1 ? (
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => goTo(page - 1)}
                            disabled={page === 1}
                            aria-label="Página anterior"
                            className="w-9 h-9 bg-white border border-stone-300 hover:border-orange-400 disabled:opacity-40"
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        {Array.from({ length: numPages }, (_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => goTo(i + 1)}
                                aria-label={`Ir a la página ${i + 1}`}
                                aria-current={page === i + 1 ? "page" : undefined}
                                className={`w-9 h-9 text-sm font-semibold border ${page === i + 1 ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-stone-300 hover:border-orange-400"}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => goTo(page + 1)}
                            disabled={page === numPages}
                            aria-label="Página siguiente"
                            className="w-9 h-9 bg-white border border-stone-300 hover:border-orange-400 disabled:opacity-40"
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </div>
                ) : <span />}

                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-800"
                >
                    <i className="bi bi-file-earmark-arrow-down"></i>
                    Descargar ficha (PDF)
                </a>
            </div>

            {fullscreen && pdf && (
                <FullscreenViewer pdf={pdf} title={title} url={url} onClose={closeFullscreen} />
            )}
        </div>
    );
}
