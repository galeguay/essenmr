import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-orange-600 text-white shadow-xl z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Nombre */}
          <a href="/" className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold tracking-wide">
              EssenMR
            </h1>
          </a>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center gap-8 text-lg">
            <a href="/" className="hover:text-orange-200 transition font-medium">
              Inicio
            </a>
            <a href="/catalogo" className="hover:text-orange-200 transition font-medium">
              Catálogo
            </a>
            <a href="/faq" className="hover:text-orange-200 transition font-medium">
              Preguntas frecuentes
            </a>
            <a href="/about_me" className="hover:text-orange-200 transition font-medium">
              Sobre mi
            </a>
          </div>

          {/* Botón Hamburguesa (móvil) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white focus:outline-none"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {/* Menú Móvil */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-4 mt-4">
              <a href="/" className="hover:bg-orange-700 px-4 py-2 rounded transition">
                Inicio
              </a>
              <a href="/catalogo" className="hover:bg-orange-700 px-4 py-2 rounded transition">
                Catálogo
              </a>
              <a href="/promociones" className="hover:bg-orange-700 px-4 py-2 rounded transition">
                Promociones
              </a>
              <a
                href="https://wa.me/5492235012258"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-bold text-center shadow-md"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}