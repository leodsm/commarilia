import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-gray-50 font-inter">
    <header className="sticky top-0 z-50 flex h-16 items-center justify-center border-b border-gray-100 bg-white shadow-sm">
      <div className="relative flex h-full w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-poppins text-[1.75rem] font-bold leading-none tracking-tight text-gray-900">
          Com<span className="text-[#fd572b]">Marilia</span>
        </Link>
      </div>
    </header>

    <main className="flex-1">{children}</main>

    <footer className="mt-12 border-t border-gray-200 bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className="text-sm text-gray-400">(c) 2024 ComMarilia. Todos os direitos reservados.</p>
      </div>
    </footer>
  </div>
);