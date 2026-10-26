import { useEffect, useRef, useState } from "react";

const MIN_MS = 500;

// Devuelve true mientras la pantalla de carga debe verse: durante la carga y,
// como mínimo, MIN_MS desde que empezó (aunque los datos ya estén listos).
export default function usePageLoader(loading) {
    const [waiting, setWaiting] = useState(true);
    const startedAt = useRef(Date.now());

    useEffect(() => {
        if (loading) {
            startedAt.current = Date.now();
            setWaiting(true);
            return;
        }
        const remaining = MIN_MS - (Date.now() - startedAt.current);
        if (remaining <= 0) {
            setWaiting(false);
            return;
        }
        const timer = setTimeout(() => setWaiting(false), remaining);
        return () => clearTimeout(timer);
    }, [loading]);

    return loading || waiting;
}
