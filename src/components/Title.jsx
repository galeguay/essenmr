export default function Title({ href, children, className = "" }) {
  const baseClassName = `text-xl md:text-3xl font-bold leading-tight ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClassName}
      >
        {children}
      </a>
    );
  }

  return (
    <h2 className={baseClassName}>
      {children}
    </h2>
  );
}