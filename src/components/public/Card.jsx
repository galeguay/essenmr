export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${className}`}>
      {children}
    </div>
  );
}