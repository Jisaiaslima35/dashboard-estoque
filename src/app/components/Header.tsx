'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-800">EstoqueJS</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">ao vivo</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              pathname === '/' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Inicio
          </Link>
          <Link
            href="/cadastro"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              pathname === '/cadastro' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cadastro
          </Link>
          
            href="https://wa.me/5584921629373"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition"
          >
            Falar com Jarvis
          </a>
        </nav>
      </div>
    </header>
  );
}
