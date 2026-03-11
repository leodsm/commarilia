import React from 'react';
import { TransformedStory } from '../types';
import { CardSkeleton, CategorySkeleton } from './Loader';

interface HomeProps {
  stories: TransformedStory[];
  isLoading: boolean;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectStory: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({
  stories,
  isLoading,
  activeCategory,
  onSelectCategory,
  onSelectStory
}) => {
  const categories = ['Todas', ...Array.from(new Set(stories.map(s => s.category)))];
  const filteredStories = activeCategory === 'Todas'
    ? stories
    : stories.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-40 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-center">
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => window.location.reload()}
          >
            <span className="text-2xl font-poppins font-bold text-gray-900 tracking-tight">
              Com<span className="text-[#fd572b]">Marília</span>
            </span>
          </div>
        </div>
      </header>

      {/* Categories Bar */}
      <div className="bg-white border-b border-gray-100 py-4 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-start sm:justify-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {isLoading ? (
              <>
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
              </>
            ) : (
              categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95 ${activeCategory === cat
                    ? "bg-[#fd572b] text-white border-[#fd572b] shadow-md shadow-orange-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                >
                  {cat}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)
          ) : filteredStories.length > 0 ? (
            filteredStories.map((story) => (
              <div
                key={story.id}
                onClick={() => onSelectStory(story.id)}
                className="group relative block aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/5 hover:ring-orange-500/20"
              >
                {/* Image with Zoom Effect */}
                <img
                  src={story.coverImage}
                  alt={story.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Modern Gradient Overlay - Conditionally Rendered */}
                {story.showOverlay && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-all duration-500"></div>
                )}

                {/* Hover Overlay Light Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Card Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end h-full">

                  {/* Category Tag - Glassmorphism */}
                  <div className="mb-auto self-start">
                    <span className="inline-block bg-black/30 backdrop-blur-md text-white/90 text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-1.5 rounded-full border border-white/30 shadow-sm hover:bg-black/40 transition-colors">
                      {story.category}
                    </span>
                  </div>

                  {/* Title Overlay */}
                  <div className="mb-0">
                    <h3 className="text-white text-lg font-bold leading-tight drop-shadow-md font-poppins line-clamp-2">
                      {story.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 animate-fade-in">
              <p className="text-gray-400 text-lg font-medium">Nenhuma notícia encontrada nesta categoria.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm font-medium">© {new Date().getFullYear()} ComMarília. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;