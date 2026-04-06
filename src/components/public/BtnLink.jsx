export default function BtnLink({ href, children, className = "" }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`z-40 inline-block px-2 py-1 font-semibold text-center text-white transition bg-orange-600 rounded-lg shadow-md cursor-pointer hover:bg-orange-800 ${className}`}
        >
            {children}
        </a>
    );
}
