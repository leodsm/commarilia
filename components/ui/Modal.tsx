import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  image?: string;
  content: string; // HTML content
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, image, content }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div className="relative w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-3xl bg-white md:rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-300 translate-y-0 animate-in slide-in-from-bottom-10">
        
        {/* Header/Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white shadow-lg transition-all"
          aria-label="Close"
        >
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content Container */}
        <div className="overflow-y-auto overscroll-contain flex-1 bg-white">
          {image && (
            <div className="w-full aspect-video md:aspect-[21/9] relative">
                <img src={image} alt={title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                     <h2 className="text-2xl md:text-4xl font-bold text-white font-poppins leading-tight text-shadow-lg max-w-2xl">
                        {title}
                    </h2>
                </div>
            </div>
          )}
          
          <div className="p-6 md:p-10 md:pt-8 max-w-2xl mx-auto">
            {!image && (
                <h2 className="text-4xl font-black text-gray-900 mb-8 font-poppins leading-tight border-b pb-4">
                    {title}
                </h2>
            )}
            
            <article 
              className="prose prose-lg md:prose-xl max-w-none text-gray-700 font-inter 
                         prose-headings:font-poppins prose-headings:font-black prose-headings:text-gray-900 prose-headings:tracking-tight
                         
                         /* Specific Heading Styles - Increased Sizes */
                         prose-h1:text-5xl md:prose-h1:text-6xl prose-h1:mt-12 prose-h1:mb-8
                         prose-h2:text-4xl md:prose-h2:text-5xl prose-h2:mt-12 prose-h2:mb-6
                         prose-h3:text-3xl md:prose-h3:text-4xl prose-h3:mt-10 prose-h3:mb-5
                         
                         /* Paragraph Styles - Increased Spacing */
                         prose-p:leading-loose prose-p:mb-12 prose-p:text-gray-600 prose-p:text-lg md:prose-p:text-xl
                         
                         /* Link Styles */
                         prose-a:text-[#fd572b] prose-a:font-semibold hover:prose-a:underline
                         
                         /* Image Styles */
                         prose-img:rounded-xl prose-img:shadow-lg prose-img:my-12 prose-img:w-full
                         
                         /* Blockquote Styles */
                         prose-blockquote:border-l-4 prose-blockquote:border-[#fd572b] prose-blockquote:bg-gray-50 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:my-10 prose-blockquote:text-xl
                         
                         /* List Styles */
                         prose-li:marker:text-[#fd572b] prose-li:my-3 prose-li:pl-2
                         
                         /* Dropcap */
                         first-letter:text-6xl first-letter:font-black first-letter:text-gray-900 first-letter:float-left first-letter:mr-4 first-letter:mt-[-8px]"
              dangerouslySetInnerHTML={{ __html: content }} 
            />
          </div>
          
          <div className="pb-10 pt-4 text-center">
            <button 
                onClick={onClose}
                className="text-base font-bold text-gray-500 hover:text-[#fd572b] transition-colors uppercase tracking-widest"
            >
                Fechar Leitura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
