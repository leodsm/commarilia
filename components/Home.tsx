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
                        className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95 ${
                            activeCategory === cat
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
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {isLoading ? (
                Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)
            ) : filteredStories.length > 0 ? (
                filteredStories.map((story) => (
                    <div 
                        key={story.id}
                        onClick={() => onSelectStory(story.id)}
                        className="group relative block aspect-card rounded-2xl overflow-hidden bg-gray-200 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                        {/* Image with Zoom Effect */}
                        <img 
                            src={story.coverImage} 
                            alt={story.title} 
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        
                        {/* Card Content */}
                        <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end h-full">
                            <div className="mb-3 transform translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                <span className="inline-block bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-white/30">
                                    {story.category}
                                </span>
                            </div>
                            <h3 className="text-white text-lg font-bold font-poppins leading-tight line-clamp-3 group-hover:text-orange-100 transition-colors">
                                {story.title}
                            </h3>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center py-20 animate-fade-in">
                    <p className="text-gray-500 text-lg font-medium">Nenhuma notícia encontrada nesta categoria.</p>
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