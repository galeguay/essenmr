// Líneas decorativas gruesas y de puntas redondeadas, en la línea del logo.
// Solo escritorio; colores suaves para no quitar protagonismo al contenido.
const PILLS = {
    // [ancho, color]
    orange: [["w-24 -rotate-12", "bg-orange-200"], ["w-14 -rotate-12", "bg-orange-300/70"], ["w-32 -rotate-12", "bg-orange-100"]],
    stone: [["w-28 rotate-6", "bg-orange-200"], ["w-16 rotate-6", "bg-orange-300/70"], ["w-20 rotate-6", "bg-orange-100"]],
};

export default function DecorPills({ tone = "orange", className = "" }) {
    return (
        <div className={`hidden lg:flex flex-col gap-3 pointer-events-none ${className}`} aria-hidden="true">
            {PILLS[tone].map(([shape, color], i) => (
                <span key={i} className={`block h-2.5 rounded-full ${shape} ${color} ${i === 1 ? "ms-8" : ""}`}></span>
            ))}
        </div>
    );
}
