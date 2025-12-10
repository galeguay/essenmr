export default function Text({ href, children, className = "" }) {
  return (
    <span
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        ${className}
      `}
    >
      {children}
    </span>
  );
}
