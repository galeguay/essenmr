import { Link } from "react-router-dom";

const BUTTON_CLASS =
    "inline-block px-4 py-2 mt-4 font-semibold text-center text-white transition bg-orange-600 rounded-lg shadow-md hover:bg-orange-800";

// Formato común de las tarjetas de invitación: ícono, título, texto y un botón.
// Con `to` el botón navega dentro del sitio; con `href` abre un enlace externo.
export default function CtaCard({ icon, title, text, buttonLabel, buttonIcon, to, href, onClick, className = "" }) {
    const content = (
        <>
            {buttonIcon && <i className={`bi ${buttonIcon} me-1`}></i>}
            {buttonLabel}
        </>
    );

    return (
        <div className={`flex items-start gap-4 p-5 text-left border border-orange-200 rounded-xl bg-orange-50 ${className}`}>
            <i className={`mt-1 text-3xl text-orange-600 bi ${icon}`}></i>
            <div>
                <p className="text-xl font-bold text-orange-900">{title}</p>
                <p className="mt-1 text-gray-700">{text}</p>
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
