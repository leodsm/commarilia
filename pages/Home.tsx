import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStories } from '@/components/contexts/StoryContext';
import { Layout } from '@/components/ui/Layout';

export const Home: React.FC = () => {
  const { stories, loading: isLoading, refreshStories } = useStories();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Sync state with URL
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory('Todas');
    }
  }, [urlCategory]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'Todas') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const categories = useMemo(() => {
    const cats = new Set(stories.map(s => s.category));
    return ['Todas', ...Array.from(cats)];
  }, [stories]);

  const filteredStories = useMemo(() => {
    if (selectedCategory === 'Todas') return stories;
    return stories.filter(s => s.category === selectedCategory);
  }, [stories, selectedCategory]);

  return (
    <Layout>
      {/* Legacy Style Categories Bar */}
      <div className="bg-white border-b border-gray-100 py-4 shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="flex items-center justify-center gap-3 overflow-x-auto no-scrollbar pb-1">
                {isLoading ? (
                    <>
                        <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse" />
                    </>
                ) : (
                    categories.map(cat => {
                        const isActive = selectedCategory === cat;
                        // Styles matching legacy "home-category"
                        const activeClasses = "bg-blue-900 text-white border-blue-900 shadow-md";
                        const inactiveClasses = "bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50";
                        
                        return (
                            <button
                                key={cat}
                                onClick={() => handleSelectCategory(cat)}
                                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 flex-shrink-0 ${isActive ? activeClasses : inactiveClasses}`}
                            >
                                {cat}
                            </button>
                        );
                    })
                )}
             </div>
        </div>
      </div>

      {/* Grid with Pull To Refresh */}
      <PullToRefresh
        onRefresh={() => refreshStories(true)}
        pullingContent={
            <div className="w-full flex justify-center p-4">
                 <div className="text-gray-400 text-sm">Puxe para atualizar...</div>
            </div>
        }
        refreshingContent={
            <div className="w-full flex justify-center p-4">
                 <div className="w-6 h-6 border-2 border-[#fd572b] border-t-transparent rounded-full animate-spin" />
            </div>
        }
      >
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {isLoading && filteredStories.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="aspect-[4/5] rounded-xl overflow-hidden shadow-sm">
                            <Skeleton className="w-full h-full bg-gray-200" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredStories.map((story) => (
                        <Link 
                            key={story.id} 
                            to={`/player?story=${story.id}&segment=${story.segments[0].id}`}
                            className="group relative block aspect-[4/5] rounded-xl overflow-hidden bg-gray-200 cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300 animate-in fade-in zoom-in-95"
                        >
                            {/* Image */}
                            <img 
                                src={story.image} 
                                alt={story.title} 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                loading="lazy"
                            />
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                            
                            {/* Content */}
                            <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end h-full">
                                <div className="mb-2">
                                    <span className="inline-block bg-[#fd572b] backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-white/30">
                                        {story.category}
                                    </span>
                                </div>
                                <h3 className="text-white text-lg md:text-xl font-bold font-poppins leading-tight line-clamp-3 transition-colors duration-300">
                                    {story.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                    
                    {filteredStories.length === 0 && !isLoading && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                            <p className="text-gray-500 text-lg">Nenhuma história encontrada nesta categoria.</p>
                            <button 
                                onClick={() => handleSelectCategory('Todas')}
                                className="mt-4 text-[#fd572b] font-bold hover:underline"
                            >
                                Ver todas as histórias
                            </button>
                        </div>
                    )}
                </div>
            )}
          </main>
      </PullToRefresh>
    </Layout>
  );
};