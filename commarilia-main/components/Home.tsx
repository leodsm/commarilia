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
    <div className="min-h-screen flex flex-col bg-white">
      <SEO title="Home" />
      {/* Header */}
      <header className="bg-[#090e1f]/95 backdrop-blur-xl sticky top-0 z-[100] shadow-lg border-b border-white/5 transition-all">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-center">
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
      <div className="bg-[#090e1f]/90 backdrop-blur-xl border-b border-white/[0.06] py-3 sticky top-16 z-[90] shadow-lg">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar pb-1">
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
                  className={`whitespace-nowrap px-5 py-1.5 rounded-full text-sm font-semibold border transition-all duration-300 active:scale-95 backdrop-blur-md ${
                    activeCategory === cat
                      ? "bg-[#fd572b] text-white border-[#fd572b] shadow-lg shadow-orange-900/40"
                      : "bg-white/[0.07] text-white/75 border-white/[0.12] hover:bg-white/[0.14] hover:text-white hover:border-white/25"
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
      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)
          ) : filteredStories.length > 0 ? (
            filteredStories.map((story) => (
              <div
                key={story.id}
                onClick={() => onSelectStory(story.id)}
                className="group relative block aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/5 hover:ring-orange-500/20 transform-gpu bg-white"
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

                {/* Title and Subtitle removed as per request */}
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