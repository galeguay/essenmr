import { useEffect, useRef, useState } from "react";

const MAX_DELAY_MS = 400;
const SHOW_RATIO = 0.15;

// Anima su contenido al entrar en pantalla y lo reinicia cuando queda debajo del área visible
// (la persona subió), para que se anime de nuevo al volver a bajar.
// effect: "up" | "left" | "right" | "zoom" | "fade". delay en ms para escalonar (tope 400 ms).
export default function Reveal({ effect = "up", delay = 0, className = "", children }) {
    const ref = useRef(null);
    // Con "reducir movimiento" todo se muestra de entrada, sin animaciones ni reinicios.
    const [reducedMotion] = useState(
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || reducedMotion) return;

        // Dos umbrales: entre 0 y 0.15 no cambia nada, así no parpadea en el borde.
        const observer = new IntersectionObserver(
            (entries) => {
                // Si el navegador junta varias entradas, vale la más reciente.
                const entry = entries[entries.length - 1];
                if (entry.intersectionRatio >= SHOW_RATIO) {
                    setVisible(true);
                } else if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
                    // Salió por abajo: se reinicia. Si salió por arriba, queda como estaba.
                    setVisible(false);
                }
            },
            { threshold: [0, SHOW_RATIO], rootMargin: "0px 0px -40px 0px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [reducedMotion]);

    return (
        <div
            ref={ref}
            data-reveal={effect}
            data-visible={reducedMotion || visible}
            style={{ transitionDelay: visible && !reducedMotion ? `${Math.min(delay, MAX_DELAY_MS)}ms` : "0ms" }}
            className={`reveal ${className}`}
        >
            {children}
        </div>
    );
}
