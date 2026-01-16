import { useState } from "react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 text-white bg-orange-600 shadow-xl">
            <div className="container px-4 mx-auto">
                <div className="flex justify-between h-16">

                    {/* Logo / Nombre */}
                    <a href="/" className="flex items-center">
                        <img src="https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/public/images/logo_blanco.webp" alt="Logo" className="h-10 ml-2" />
                    </a>

                    {/* Menú Desktop */}
                    <div className="items-center hidden gap-8 text-lg md:py-2 md:flex md:self-end">
                        <a href="/" className="font-medium transition hover:text-orange-200">
                            Inicio
                        </a>
                        <a href="/catalogo" className="font-medium transition hover:text-orange-200">
                            Catálogo
                        </a>
                        <a href="/faq" className="font-medium transition hover:text-orange-200">
                            Preguntas frecuentes
                        </a>
                        <a href="/about_me" className="font-medium transition hover:text-orange-200">
                            Sobre mi
                        </a>
                    </div>

                    {/* Botón Hamburguesa (móvil) */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-white md:hidden focus:outline-none"
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
                    <div className="pb-4 md:hidden">
                        <div className="flex flex-col gap-4 mt-4">
                            <a href="/" className="px-4 py-2 transition rounded hover:bg-orange-700">
                                Inicio
                            </a>
                            <a href="/catalogo" className="px-4 py-2 transition rounded hover:bg-orange-700">
                                Catálogo
                            </a>
                            <a href="/promociones" className="px-4 py-2 transition rounded hover:bg-orange-700">
                                Promociones
                            </a>
                            <a
                                href="https://wa.me/5492235012258"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 font-bold text-center bg-green-500 rounded-lg shadow-md hover:bg-green-600"
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