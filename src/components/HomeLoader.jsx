import { useEffect, useState } from "react";

const LOGO = "https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/public/images/logo_blanco.webp";
const LOGO_DELAY_MS = 300;
const FADE_MS = 300;

// Capa que cubre toda la ventana (barra y pie incluidos) mientras el home termina de cargar.
// Está opaca desde el primer instante; el logo recién aparece a los 300 ms para que, si todo
// carga rápido, no se vea un parpadeo.
export default function HomeLoader({ visible }) {
    const [mounted, setMounted] = useState(visible);
    const [showLogo, setShowLogo] = useState(false);

    useEffect(() => {
        if (!visible) return;
        const timer = setTimeout(() => setShowLogo(true), LOGO_DELAY_MS);
        return () => clearTimeout(timer);
    }, [visible]);

    useEffect(() => {
        if (visible || !mounted) return;
        const timer = setTimeout(() => setMounted(false), FADE_MS);
        return () => clearTimeout(timer);
    }, [visible, mounted]);

    if (!mounted) return null;

    return (
        <div
            role="status"
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-orange-600 transition-opacity duration-300 motion-reduce:transition-none ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
            <span className="sr-only">Cargando</span>
            <div className={`flex flex-col items-center gap-6 transition-opacity duration-300 ${showLogo ? "opacity-100" : "opacity-0"}`}>
                <img src={LOGO} alt="" className="h-14 w-auto" />
                <div className="w-40 h-1 overflow-hidden rounded-full bg-white/30">
                    <div className="loader-bar w-1/3 h-full bg-white rounded-full" />
                </div>
            </div>
        </div>
    );
}
