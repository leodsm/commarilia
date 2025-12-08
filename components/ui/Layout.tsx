import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col bg-gray-50 font-inter min-h-screen">
      {/* Legacy Style Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 h-16 flex items-center justify-center relative shadow-sm">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center relative h-full">
            {/* Centered Logo */}
            <div className="flex items-center gap-2">
                <Link to="/" className="font-poppins font-bold text-[1.75rem] tracking-tight text-gray-900 leading-none">
                    Com<span className="text-[#fd572b]">Marília</span>
                </Link>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-400 text-sm">© 2024 ComMarília. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
