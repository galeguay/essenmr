export default function BtnLink({ href, children, className = "" }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`z-40 inline-block px-2 py-1 font-semibold text-center text-green-600 transition bg-white rounded-lg shadow-md cursor-pointer hover:bg-green-200${className}`}
        >
            {children}
        </a>
    );
}
