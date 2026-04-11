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

        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain bg-white outline-none pt-6 md:pt-8"
          tabIndex={-1} // Makes div programmatically focusable
        >
          {/* Header Text */}
          <div className="px-6 md:px-8 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={onClose}
                className="h-8 flex flex-shrink-0 px-2 justify-center hover:px-3 hover:pr-4 items-center gap-0 hover:gap-1.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-transparent transition-all duration-[400ms] active:scale-95 text-gray-700 hover:text-black group overflow-hidden shadow-sm focus:outline-none"
                aria-label="Voltar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 flex-shrink-0 group-hover:-translate-x-0.5 transition-transform duration-[400ms]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <span className="text-[11px] font-poppins font-bold uppercase tracking-wider mt-[1px] max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 transition-all duration-[400ms] ease-in-out whitespace-nowrap">Voltar</span>
              </button>
              <span className="inline-block px-3 py-1 text-xs font-bold text-white bg-[#fd572b] rounded-full uppercase tracking-wide">
              {story.category}
            </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-poppins leading-tight mt-1">
              {story.title}
            </h2>
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
                className="h-8 flex flex-shrink-0 px-2 justify-center hover:px-3 hover:pr-4 items-center gap-0 hover:gap-1.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-transparent transition-all duration-[400ms] active:scale-95 text-gray-700 hover:text-black group overflow-hidden shadow-sm focus:outline-none"
                aria-label="Voltar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 flex-shrink-0 group-hover:-translate-x-0.5 transition-transform duration-[400ms]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <span className="text-[11px] font-poppins font-bold uppercase tracking-wider mt-[1px] max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 transition-all duration-[400ms] ease-in-out whitespace-nowrap">Voltar</span>
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