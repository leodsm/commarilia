import React, { useEffect, useRef } from 'react';
import { TransformedStory } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: TransformedStory | null;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, story }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Automatically focus the content area to allow keyboard scrolling immediately
      // Small timeout ensures the element is rendered and transition started
      setTimeout(() => {
        contentRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !story) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Content Panel - Slide Up Animation */}
      <div className="relative bg-white w-full h-[90vh] md:h-auto md:max-h-[90vh] md:max-w-2xl rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-slide-up">

        {/* Top Close Button (Desktop/Accessibility) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
          aria-label="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain bg-white outline-none"
          tabIndex={-1} // Makes div programmatically focusable
        >
          {/* Header Image */}
          <div className="relative h-64 md:h-80 w-full shrink-0">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="inline-block px-3 py-1 mb-3 text-xs font-bold text-white bg-[#fd572b] rounded-full uppercase tracking-wide">
                {story.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white font-poppins leading-tight text-shadow-lg">
                {story.title}
              </h2>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 md:p-8">
            <div
              className="prose prose-lg max-w-none text-gray-800 font-inter leading-relaxed
                         prose-headings:font-poppins prose-headings:font-bold prose-headings:text-gray-900
                         prose-p:mb-4 prose-strong:text-gray-900 prose-ul:list-disc prose-ul:pl-5
                         prose-a:text-[#fd572b] prose-a:font-medium hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />

            <hr className="my-8 border-gray-200" />

            {/* Bottom Close Button (Action) */}
            {/* Bottom Close Button (Action) - Redesigned to X icon only */}
            <div className="flex justify-center my-8">
              <button
                onClick={onClose}
                className="w-14 h-14 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md active:scale-95"
                aria-label="Fechar Notícia"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="h-8"></div> {/* Safe area spacer */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;