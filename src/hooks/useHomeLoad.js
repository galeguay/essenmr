import { useEffect, useRef, useState } from "react";
import { loadHomeData, readHomeCache } from "../lib/homeData";

const MAX_WAIT_MS = 4000;
const EMPTY = { announcements: [], discounts: [], newProducts: [] };

const nextFrames = (count) =>
    new Promise((resolve) => {
        const step = (left) => (left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1)));
        step(count);
    });

// Espera a que carguen (o fallen) las imágenes que están dentro del alto de la ventana.
const waitForVisibleImages = (root) => {
    if (!root) return Promise.resolve();

    const pending = [...root.querySelectorAll("img")]
        .filter((img) => {
            const { top, bottom } = img.getBoundingClientRect();
            return bottom > 0 && top < window.innerHeight && !img.complete;
        })
        .map(
            (img) =>
                new Promise((resolve) => {
                    img.addEventListener("load", resolve, { once: true });
                    img.addEventListener("error", resolve, { once: true });
                })
        );

    return Promise.all(pending);
};

// Orquesta la carga del home. phase: 'ready-cache' (datos en caché, sin pantalla de carga),
// 'loading' (esperando datos e imágenes de la primera pantalla) o 'done'.
export default function useHomeLoad(contentRef) {
    const [state, setState] = useState(() => {
        const cached = readHomeCache();
        return cached
            ? { data: cached, phase: "ready-cache" }
            : { data: EMPTY, phase: "loading" };
    });
    const needsLoad = useRef(state.phase === "loading");

    useEffect(() => {
        if (!needsLoad.current) return;

        let cancelled = false;

        const finish = () => {
            if (cancelled) return;
            setState((prev) => (prev.phase === "loading" ? { ...prev, phase: "done" } : prev));
        };

        const timer = setTimeout(finish, MAX_WAIT_MS);

        loadHomeData().then(async (result) => {
            if (cancelled) return;
            const { allOk: _allOk, ...data } = result;
            setState((prev) => ({ ...prev, data }));

            // Los datos que llegan después del tope solo actualizan la lista; la fase ya es 'done'.
            await nextFrames(2);
            if (cancelled) return;
            await waitForVisibleImages(contentRef.current);
            clearTimeout(timer);
            finish();
        });

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [contentRef]);

    return state;
}
