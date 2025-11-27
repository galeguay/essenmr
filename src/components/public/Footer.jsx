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
    <footer className="bg-gray-900 text-white py-6 flex flex-col items-center justify-center">
      <div className="flex flex-col sm:flex-col md:flex-row md:columns-2 gap-6 md:gap-16">
        <ul className="list-none text-left columns md:columns-2 gap-4">
          {links.map((link) => (
            <li key={link.text} className="break-inside-avoid border-l ps-2">
              <Link to={link.to}>
                {link.text}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-col items-start gap-2">
            <BtnLink href="https://g.co/kgs/NuUKntR">
              <i className="bi bi-google"></i> Perfil Google
            </BtnLink>

            <BtnLink href="tel:+5492235012258">
              <i className="bi bi-telephone-fill"></i> Llamar (+54 9 223 501-2258)
            </BtnLink>

            <BtnLink href="https://wa.me/5492235012258">
              <i className="bi bi-whatsapp"></i> Enviar Whatsapp
            </BtnLink>
        </div>
      </div>
      <p className="mt-6 text-gray-400 text-left">© 2026 - Todos los derechos reservados</p>
    </footer>
  )
}