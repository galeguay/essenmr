import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const SCROLL_KEY = "essenmr:home:scroll";

const readSavedScroll = () => {
    try {
        return Number(sessionStorage.getItem(SCROLL_KEY)) || 0;
    } catch {
        return 0;
    }
};

const writeSavedScroll = (value) => {
    try {
        sessionStorage.setItem(SCROLL_KEY, String(value));
    } catch {
        // sessionStorage no disponible: no se restaura el scroll.
    }
};

// Guarda el scroll del home y lo restaura al volver con atrás/adelante.
// Si la URL trae un ancla, se desplaza a esa sección. Se ejecuta cuando la carga terminó
// (phase distinto de 'loading'), antes de que la capa de carga termine de desvanecerse.
export default function useHomeScroll(phase) {
    const location = useLocation();
    const navigationType = useNavigationType();
    const lastY = useRef(null);
    const restored = useRef(false);

    useEffect(() => {
        const previous = window.history.scrollRestoration;
        window.history.scrollRestoration = "manual";

        let timer = null;
        const onScroll = () => {
            lastY.current = window.scrollY;
            if (timer) return;
            timer = setTimeout(() => {
                timer = null;
                save();
            }, 150);
        };
        // Solo se guarda si hubo scroll: evita pisar el valor guardado con 0 antes de restaurarlo.
        const save = () => {
            if (lastY.current !== null) writeSavedScroll(lastY.current);
        };
        const onPageHide = save;

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("pagehide", onPageHide);

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("pagehide", onPageHide);
            clearTimeout(timer);
            save();
            window.history.scrollRestoration = previous;
        };
    }, []);

    useEffect(() => {
        if (phase === "loading" || restored.current) return;
        restored.current = true;

        if (location.hash) {
            try {
                document.querySelector(location.hash)?.scrollIntoView({ behavior: "auto" });
            } catch {
                // Ancla inválida: se ignora.
            }
            return;
        }

        // En la primera carga del documento el router siempre informa 'POP', así que se mira
        // el tipo de navegación del navegador; en navegaciones internas alcanza con el router.
        const isInitialLoad = location.key === "default";
        const navEntry = performance.getEntriesByType("navigation")[0];
        const isBackForward = isInitialLoad
            ? navEntry?.type === "back_forward"
            : navigationType === "POP";

        window.scrollTo(0, isBackForward ? readSavedScroll() : 0);
    }, [phase, location.hash, location.key, navigationType]);
}
