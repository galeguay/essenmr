//import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BtnLink from './BtnLink';
//import { pb } from '../../lib/pocketbase.js';

export default function Footer() {
  const links = [
    { text: 'Inicio', to: '/' },
    { text: 'Catálogo', to: '/catalogo' },
    { text: 'Preguntas Frecuentes', to: '/faq' },
    { text: 'Sobre mi', to: '/about_me' },
  ];

  return (
    <footer className="flex flex-col items-center justify-center py-6 text-white bg-gray-900">
      <div className="flex flex-col gap-6 sm:flex-col md:flex-row md:columns-2 md:gap-16">
        <ul className="gap-4 text-left list-none">
          {links.map((link) => (
            <li key={link.text} className="border-l break-inside-avoid ps-2">
              <Link to={link.to}>
                {link.text}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-col items-start gap-2">
            <BtnLink href="https://g.co/kgs/NuUKntR" className="btn-sm">
              <i className="bi bi-google"></i> Perfil Google
            </BtnLink>

            <BtnLink href="tel:+5492235012258" className="btn-sm">
              <i className="bi bi-telephone-fill"></i> Llamar (+54 9 223 501-2258)
            </BtnLink>

            <BtnLink href="https://wa.me/5492235012258" className="btn-sm">
              <i className="bi bi-whatsapp"></i> Enviar Whatsapp
            </BtnLink>
        </div>
      </div>
      <p className="mt-6 text-left text-gray-400">© 2026 - Todos los derechos reservados</p>
    </footer>
  )
}