import { useEffect, useRef, useState } from "react";

// Anima su contenido al entrar en pantalla (una sola vez).
// effect: "up" | "left" | "right" | "zoom" | "fade". delay en ms para escalonar.
export default function Reveal({ effect = "up", delay = 0, className = "", children }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            data-reveal={effect}
            data-visible={visible}
            style={{ transitionDelay: `${delay}ms` }}
            className={`reveal ${className}`}
        >
            {children}
        </div>
    );
}
