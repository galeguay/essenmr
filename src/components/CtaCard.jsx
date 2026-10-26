import { Link } from "react-router-dom";

const BUTTON_CLASS =
    "inline-block px-4 py-2 mt-4 font-semibold text-center text-white transition bg-orange-600 rounded-lg shadow-md hover:bg-orange-800";

// Formato común de las tarjetas de invitación: ícono, título, texto y un botón.
// `square` la vuelve más cuadrada: contenido apilado y centrado.
// Con `to` el botón navega dentro del sitio; con `href` abre un enlace externo.
export default function CtaCard({ icon, title, text, buttonLabel, buttonIcon, to, href, onClick, square = false, className = "" }) {
    const content = (
        <>
            {buttonIcon && <i className={`bi ${buttonIcon} me-1`}></i>}
            {buttonLabel}
        </>
    );

    return (
        <div className={`flex gap-4 border border-orange-200 rounded-xl bg-orange-50 ${square ? "flex-col items-center justify-center p-8 text-center min-h-56 lg:gap-5 lg:p-10 lg:min-h-72" : "items-start p-5 text-left"} ${className}`}>
            <i className={`text-orange-600 bi ${icon} ${square ? "text-4xl lg:text-5xl" : "mt-1 text-3xl"}`}></i>
            <div>
                <p className={`font-bold text-orange-900 ${square ? "text-2xl" : "text-xl"}`}>{title}</p>
                {text && <p className="mt-1 text-gray-700">{text}</p>}
                {to ? (
                    <Link to={to} onClick={onClick} className={BUTTON_CLASS}>{content}</Link>
                ) : (
                    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={BUTTON_CLASS}>
                        {content}
                    </a>
                )}
            </div>
        </div>
    );
}
