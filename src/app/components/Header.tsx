'use client'

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Início', href: 'https://dashboardestoque.vercel.app/' },
    { label: 'Cadastro', href: 'https://dashboard-estoque-ruby.vercel.app/cadastro' },
    { label: 'Falar com Jarvis', href: 'https://wa.me/5584921629373', external: true }
  ];

  return (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="https://dashboardestoque.vercel.app/" className="text-xl font-bold text-white hover:text-blue-400 transition">
            📦 Estoque
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            {menuItems.map((item, i) => (
              item.external ? (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-blue-400 transition text-sm font-medium"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={i}
                  href={item.href}
                  className="text-white hover:text-blue-400 transition text-sm font-medium"
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {menuItems.map((item, i) => (
              item.external ? (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-white hover:text-blue-400 transition text-sm font-medium py-2"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={i}
                  href={item.href}
                  className="block text-white hover:text-blue-400 transition text-sm font-medium py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
