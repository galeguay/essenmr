// src/components/Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { pb } from '../../lib/pocketbase.js';

export default function Sidebar({ title = "Admin" }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(!isOpen);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    window.location.href = '/admin/login';
  };

  const links = [
    { text: 'Productos', to: '/admin/products', icon: 'bi-box' },
    { text: 'Líneas de productos', to: '/admin/productLines', icon: 'bi-boxes' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div>
      {/* Header fijo */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-14 bg-linear-to-r from-indigo-600 to-purple-700 text-white shadow-lg">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-14 h-14 hover:bg-white/20 transition"
          >
            <i className="bi bi-list text-3xl"></i>
        </button>
        <div className="flex items-center justify-center w-14 h-14">
          <i className="bi bi-card-image text-3xl"></i>
        </div>
        <h1 className="text-xl font-bold">{title}</h1>
      </header>

      {/* === Sidebar estrecha (lg a xl) → solo iconos + tooltips === */}
      <aside className="fixed top-0 left-0 z-40 hidden lg:block 2xl:hidden w-12 h-full bg-linear-to-b from-indigo-800 to-purple-900 text-white pt-20">
        <nav className="px-1">
          <ul className="space-y-3">
            {links.map((link) => (
              <li key={link.text} className="group relative">
                <Link
                  to={link.to}
                  className={`flex items-center justify-center w-full h-12 rounded-lg transition hover:bg-white/20 ${
                    isActive(link.to) ? 'bg-white/30' : ''
                  }`}
                >
                  <i className={`bi ${link.icon} text-2xl`}></i>
                </Link>
                {/* Tooltip */}
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50 shadow-xl">
                  {link.text}
                </span>
              </li>
            ))}
          </ul>
        </nav>

        {/* Botones inferiores en versión estrecha */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-4">
          <Link
            to="/account/settings"
            className="p-3 rounded-lg hover:bg-white/20 transition"
            title="Configuración"
          >
            <i className="bi bi-gear-wide-connected text-xl"></i>
          </Link>
          <button
            onClick={handleLogout}
            className="p-3 rounded-lg hover:bg-red-600/40 transition"
            title="Cerrar sesión"
          >
            <i className="bi bi-box-arrow-right text-xl"></i>
          </button>
        </div>
      </aside>

      {/* === Sidebar ancha (2xl y móvil cuando abierta) === */}
      <aside
        className={`
          fixed top-0 left-0 z-40 flex flex-col justify-between h-full bg-linear-to-b from-indigo-800 to-purple-900 text-white transition-transform duration-300 w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          2xl:translate-x-0
        `}
      >
        <div>
          <div className="h-14 flex items-center justify-center border-b border-white/20">
            <i className="bi bi-card-image text-4xl"></i>
          </div>

          <nav className="mt-6 px-4">
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.text}>
                  <Link
                    to={link.to}
                    className={`flex items-center px-4 py-3 rounded-lg transition hover:bg-white/20 ${
                      isActive(link.to) ? 'bg-white/30' : ''
                    }`}
                  >
                    <i className={`bi ${link.icon} text-xl w-8`}></i>
                    <span className="ml-3">{link.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Botones inferiores en versión ancha */}
        <div className="p-6 border-t border-white/20">
          <div className="flex gap-6 justify-center">
            <Link
              to="/account/settings"
              className="p-4 rounded-xl hover:bg-white/20 transition"
              title="Configuración"
            >
              <i className="bi bi-gear-wide-connected text-2xl"></i>
            </Link>
            <button
              onClick={handleLogout}
              className="p-4 rounded-xl hover:bg-red-600/40 transition"
              title="Cerrar sesión"
            >
              <i className="bi bi-box-arrow-right text-2xl"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}