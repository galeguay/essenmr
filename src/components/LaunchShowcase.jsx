import { toTitleCase } from "../utils/toTitleCase";
import BtnWpp from "./BtnWpp";
import PdfInfographic from "./PdfInfographic";
import VerticalVideo from "./VerticalVideo";
import { hasLaunchMedia } from "../utils/launchMedia";

// Bloque de un lanzamiento: video vertical 9:16 + ficha/infografía en PDF.
// Con `compact` se omite el encabezado (para usarlo dentro de la ficha del producto).
export default function LaunchShowcase({ product, compact = false }) {
    if (!hasLaunchMedia(product)) return null;

    const name = toTitleCase(product.name);
    const hasVideo = Boolean(product.video_url);
    const hasPdf = Boolean(product.info_pdf);

    return (
        <article id={`p-${product.essen_id}`} className="scroll-mt-24">
            {!compact && (
                <header className="mb-6 lg:mb-8">
                    {product.product_line?.name && (
                        <p className="mb-2 text-xs font-semibold tracking-widest uppercase lg:text-sm text-stone-500">
                            {product.product_line.name}
                        </p>
                    )}
                    <h2 className="text-3xl font-bold leading-tight text-gray-900 lg:text-5xl">
                        {product.is_new && (
                            <span className="mr-3 align-middle px-2 py-0.5 text-sm lg:text-base font-bold uppercase tracking-wide text-white bg-orange-600">
                                Nuevo
                            </span>
                        )}
                        {name}
                    </h2>
                    {product.description && (
                        <p className="max-w-3xl mt-4 leading-relaxed text-gray-600 lg:text-lg line-clamp-4">
                            {product.description}
                        </p>
                    )}
                </header>
            )}

            <div className={`grid gap-8 lg:gap-12 ${hasVideo && hasPdf ? "lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] items-start" : ""}`}>
                {hasVideo && (
                    <div className="lg:sticky lg:top-24">
                        <p className="flex items-center justify-center gap-2 mb-3 text-sm font-semibold tracking-wide uppercase text-stone-500">
                            <i className="text-orange-600 bi bi-play-btn-fill"></i> Miralo en acción
                        </p>
                        <VerticalVideo url={product.video_url} title={name} poster={product.image} />
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    {hasPdf && (
                        <div>
                            <p className="flex items-center gap-2 mb-3 text-sm font-semibold tracking-wide uppercase text-stone-500">
                                <i className="text-orange-600 bi bi-file-earmark-richtext-fill"></i> Ficha del producto
                            </p>
                            <PdfInfographic key={product.info_pdf} url={product.info_pdf} title={name} />
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 p-5 border bg-orange-50 border-orange-200">
                        <p className="flex-1 min-w-[200px] font-semibold text-orange-900">
                            ¿Te interesa el {name}? Consultame disponibilidad y formas de pago.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            {!compact && (
                                <a
                                    href={`/producto/${product.essen_id}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-orange-700 bg-white border border-orange-300 rounded-lg hover:border-orange-500"
                                >
                                    Ver producto <span aria-hidden="true">→</span>
                                </a>
                            )}
                            <BtnWpp message={`Hola, vi el lanzamiento "${product.name}" y quiero averiguar`} />
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
