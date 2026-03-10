export default function Title({ href, children, className = "" }) {
  return (
    <span
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-2xl xl:text-3xl 2xl:px-12
        ${className}
      `}
    >
      {children}
    </span>
  );
}
