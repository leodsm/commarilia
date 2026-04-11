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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pt-10 sm:p-6 md:p-8 perspective-1000">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Content Panel - Slide Up Animation */}
      <div className="relative bg-[#fffaf5] w-full max-h-[85vh] md:max-h-[90vh] md:max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-slide-up">

        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain bg-[#fffaf5] outline-none"
          tabIndex={-1} // Makes div programmatically focusable
        >
          {/* Header Ticket Escuro (Azul Marinho) */}
          <div className="bg-[#1a2035] shrink-0 pt-3 pb-8 md:pt-4 md:pb-10 px-6 md:px-8 rounded-t-2xl rounded-b-2xl shadow-lg z-20 relative">
            {/* Drag Handle — clicável para fechar */}
            <button
              onClick={onClose}
              className="block mx-auto mb-5 w-12 h-1 bg-[#fd572b] rounded-full hover:bg-white/80 transition-colors duration-200 cursor-pointer focus:outline-none"
              aria-label="Fechar"
            />
            <div className="flex items-start gap-4 mb-3">
              <button
                onClick={onClose}
                className="flex shrink-0 items-center justify-center text-white/70 hover:text-white transition-all group focus:outline-none mt-1.5"
                aria-label="Voltar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-[18px] h-[18px] md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform drop-shadow-sm">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                {story.title}
              </h2>
            </div>
            
            {/* Categoria Bridge Badge — laranja vibrante */}
            <span className="absolute -bottom-3 right-6 md:right-8 px-4 py-1.5 text-xs font-bold text-white bg-[#fd572b] rounded-full shadow-md uppercase tracking-wide z-30">
              {story.category}
            </span>
          </div>

          {/* Content Body */}
          <div className="p-6 md:p-8">
            <div
              className="custom-prose-content prose prose-lg max-w-none text-gray-800 font-inter leading-relaxed whitespace-pre-line
                         prose-headings:text-gray-900 
                         prose-p:mb-4 prose-strong:text-gray-900 prose-ul:list-disc prose-ul:pl-5
                         prose-a:text-[#fd572b] prose-a:font-medium hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />

            <hr className="my-8 border-gray-200" />

            {/* Bottom Close Button (Action) */}
            <div className="flex justify-center my-8">
              <button
                onClick={onClose}
                className="flex flex-shrink-0 justify-center items-center gap-1.5 border border-transparent transition-all duration-[400ms] active:scale-95 text-gray-400 hover:text-gray-700 group focus:outline-none"
                aria-label="Voltar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform duration-[400ms]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <span className="text-[12px] font-poppins font-bold uppercase tracking-wider mt-[1px] transition-all duration-[400ms] ease-in-out whitespace-nowrap">Voltar</span>
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