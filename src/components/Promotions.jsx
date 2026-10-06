import { useEffect, useState } from "react";
import { typography } from "../styles/typography";
import BtnWpp from "./BtnWpp";

const PROMO_IMAGE = "https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/public/images/tarjetas.webp";

export default function Promotions() {
    const [open, setOpen] = useState(false);

    const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' });

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <section id="promociones" className="w-full py-12 bg-emerald-50 border-y border-emerald-100">
        <div className="container flex flex-col md:mx-auto">
            <h2 className={`${typography.sectionTitle} px-6 md:px-16 mb-3`}>
                Promociones financieras en {currentMonth.toUpperCase()}
            </h2>
            <p className="px-6 md:px-16 mb-8 text-emerald-900/80 md:text-lg">
                Elegí tu banco y pagá en cuotas sin interés. Tocá la imagen para verla en grande.
            </p>

            <div className="flex justify-center px-4">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label="Ver promociones financieras en grande"
                    className="relative w-fit p-3 bg-white border border-emerald-200 shadow-sm cursor-zoom-in hover:shadow-lg transition-shadow"
                >
                    <img
                        src={PROMO_IMAGE}
                        className="object-contain h-auto w-250 max-w-full md:p-3"
                        alt="Promociones financieras con tarjetas y bancos"
                        loading="lazy"
                    />
                    <span className="absolute px-3 py-1 text-sm font-semibold text-white bg-orange-600 bottom-5 right-5 shadow">
                        <i className="bi bi-zoom-in me-1"></i> Ampliar
                    </span>
                </button>
            </div>

            <div className="flex flex-col items-center gap-3 px-6 mt-8 text-center">
                <p className="text-sm text-emerald-900/70">
                    Las promociones pueden cambiar. Consultá las condiciones vigentes.
                </p>
                <BtnWpp message="Hola, quiero consultar por las promociones financieras vigentes" />
            </div>

            {open && (
                <div
                    className="fixed inset-0 z-[100] flex flex-col bg-black/90"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setOpen(false)}
                >
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Cerrar"
                        className="self-end m-3 px-4 py-2 text-lg font-bold text-white bg-orange-600 hover:bg-orange-700"
                    >
                        <i className="bi bi-x-lg me-2"></i>Cerrar
                    </button>
                    <div className="flex-1 overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={PROMO_IMAGE}
                            alt="Promociones financieras con tarjetas y bancos"
                            className="mx-auto h-auto min-w-[900px] md:min-w-0 md:w-full md:max-w-4xl"
                        />
                    </div>
                </div>
            )}
        </div>
        </section>
    );
}
