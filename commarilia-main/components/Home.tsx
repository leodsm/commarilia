import React from 'react';
import { TransformedStory } from '../types';
import { CardSkeleton, CategorySkeleton } from './Loader';
import SEO from './SEO';

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
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <SEO title="Home" />
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-[100] shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-center">
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => window.location.reload()}
          >
            <span className="text-2xl font-poppins font-bold text-white tracking-tight">
              Com<span className="text-[#fd572b]">Marília</span>
            </span>
          </div>
        </div>
      </header>

      {/* Categories Bar */}
      <div className="bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/10 py-4 sticky top-16 z-[90] shadow-sm">
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
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium border transition-all duration-300 active:scale-95 ${activeCategory === cat
                    ? "bg-[#fd572b] text-white border-[#fd572b] shadow-lg shadow-[#fd572b]/20"
                    : "bg-white/5 text-gray-300 border-white/10 hover:border-white/30 hover:bg-white/10"
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
                className="group relative block aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(253,87,43,0.3)] ring-1 ring-white/10 hover:ring-[#fd572b]/50 transform-gpu bg-black"
              >
                {/* Image with Zoom Effect */}
                <img
                  src={story.coverImage}
                  alt={story.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />

                {/* Category Tag moved to top-left */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-block bg-black/50 backdrop-blur-md border border-white/30 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-sm">
                    {story.category}
                  </span>
                </div>

                {/* Play Indicator Overlay to show it's a media story */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white ml-1">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Gradient for dark vibe on hover */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
      <footer className="bg-[#050505] border-t border-white/5 mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm font-medium">© {new Date().getFullYear()} ComMarília. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;