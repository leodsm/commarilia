import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  categories: string[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  isLoading 
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#151922] border-b border-white/10 shadow-lg shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-6">
        
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 font-poppins font-bold text-2xl tracking-tight text-white hover:opacity-90 transition-opacity">
          Com<span className="text-[#fd572b]">Marília</span>
        </Link>

        {/* Categories */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-3 mask-linear-fade">
          {isLoading ? (
            <>
              <div className="h-8 w-20 bg-white/10 rounded-full animate-pulse" />
              <div className="h-8 w-24 bg-white/10 rounded-full animate-pulse" />
              <div className="h-8 w-16 bg-white/10 rounded-full animate-pulse" />
            </>
          ) : (
            categories.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory && onSelectCategory(cat)}
                  disabled={!onSelectCategory}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#fd572b] to-[#ff7e5f] text-white shadow-lg shadow-[#fd572b]/20 scale-105' 
                      : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                  } ${!onSelectCategory ? 'cursor-default' : ''}`}
                >
                  {cat}
                </button>
              );
            })
          )}
        </div>
      </div>
    </header>
  );
};