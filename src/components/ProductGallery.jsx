import { useState } from "react";
import VerticalVideo from "./VerticalVideo";

const FALLBACK = "../../cacerola.webp";

// Galería del producto: foto principal + fotos adicionales + video (si lo tiene).
// Las miniaturas permiten cambiar lo que se muestra en el visor grande.
export default function ProductGallery({ product }) {
    const items = [
        { type: "image", src: product.image || FALLBACK },
        ...(product.images || []).filter(Boolean).map((src) => ({ type: "image", src })),
        ...(product.video_url ? [{ type: "video", src: product.video_url }] : []),
    ];
    const [active, setActive] = useState(0);
    const current = items[Math.min(active, items.length - 1)];

    return (
        <div className="flex flex-col gap-3">
            <figure className="relative flex items-center justify-center aspect-square lg:aspect-auto lg:min-h-[480px]">
                {current.type === "video" ? (
                    <VerticalVideo url={current.src} title={product.name} poster={product.image} />
                ) : (
                    <img
                        key={current.src}
                        src={current.src}
                        alt={product.name}
                        className="object-contain w-full h-full"
                        onError={(e) => {
                            e.currentTarget.src = FALLBACK;
                        }}
                    />
                )}
            </figure>

            {items.length > 1 && (
                <ul className="flex gap-2 pb-1 overflow-x-auto">
                    {items.map((item, i) => (
                        <li key={`${item.type}-${i}`} className="shrink-0">
                            <button
                                type="button"
                                onClick={() => setActive(i)}
                                aria-label={item.type === "video" ? "Ver video" : `Ver foto ${i + 1}`}
                                aria-current={i === active}
                                className={`relative block w-16 h-16 overflow-hidden bg-white border-2 rounded-lg sm:w-20 sm:h-20 ${
                                    i === active ? "border-orange-600" : "border-stone-200 hover:border-stone-400"
                                }`}
                            >
                                {item.type === "video" ? (
                                    <span className="flex items-center justify-center w-full h-full text-white bg-stone-900">
                                        <i className="text-2xl bi bi-play-circle-fill"></i>
                                    </span>
                                ) : (
                                    <img src={item.src} alt="" loading="lazy" className="object-cover w-full h-full" />
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
