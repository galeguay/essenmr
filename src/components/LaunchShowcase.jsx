import { toTitleCase } from "../utils/toTitleCase";
import BtnWpp from "./BtnWpp";
import PdfInfographic from "./PdfInfographic";

// Ficha/infografía en PDF del producto, con un llamado a consultar por WhatsApp.
// El video vive en la galería del producto (ProductGallery).
export default function LaunchShowcase({ product }) {
    if (!product.info_pdf) return null;

    const name = toTitleCase(product.name);

    return (
        <article id={`p-${product.essen_id}`} className="scroll-mt-24">
            <div className="flex flex-col gap-6">
                <div>
                    <p className="flex items-center gap-2 mb-3 text-sm font-semibold tracking-wide uppercase text-stone-500">
                        <i className="text-orange-600 bi bi-file-earmark-richtext-fill"></i> Ficha del producto
                    </p>
                    <PdfInfographic key={product.info_pdf} url={product.info_pdf} title={name} />
                </div>

                <div className="flex flex-wrap items-center gap-4 p-5 border bg-orange-50 border-orange-200">
                    <p className="flex-1 min-w-[200px] font-semibold text-orange-900">
                        ¿Te interesa el {name}? Consultame disponibilidad y formas de pago.
                    </p>
                    <BtnWpp message={`Hola, vi el lanzamiento "${product.name}" y quiero averiguar`} />
                </div>
            </div>
        </article>
    );
}
