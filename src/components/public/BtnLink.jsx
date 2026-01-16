export default function BtnLink({ href, children, className = "" }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-soft btn-primary ${className}`}
        >
            {children}
        </a>
    );
}
