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
      <div className="relative bg-[#fffaf5] w-full h-[88vh] md:h-auto md:max-h-[85vh] md:max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col animate-slide-up">

        {/* Scrollable Content Container */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain outline-none bg-[#fffaf5] no-scrollbar"
          tabIndex={-1}
        >
          {/* Orange Ticket Header - Now scrolls with content */}
          <div className="bg-[#fd572b] pt-4 pb-6 px-6 md:px-8 rounded-b-3xl shadow-lg relative z-20">
            {/* Drag handle (mobile only) */}
            <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-4 md:hidden"></div>

            {/* Back icon + Title inline */}
            <div className="flex items-start gap-3">
              <button
                onClick={onClose}
                className="flex-shrink-0 mt-1 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-all duration-200 active:scale-95 focus:outline-none shadow-sm"
                aria-label="Voltar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <h2 className="text-xl md:text-2xl font-bold text-white font-poppins leading-tight drop-shadow-sm pr-12">
                {story.title}
              </h2>
            </div>

            {/* Category Badge — bridges the bottom edge */}
            <span className="absolute -bottom-3.5 right-6 md:right-8 inline-block px-4 py-1.5 text-xs font-bold text-white bg-black border-[3px] border-[#fffaf5] rounded-full uppercase tracking-wide shadow-md z-30">
              {story.category}
            </span>
          </div>

          {/* Text Content */}
          <div className="p-6 md:p-8 pt-10">
            <div
              className="custom-prose-content prose prose-lg max-w-none text-gray-800 font-inter leading-relaxed whitespace-pre-line
                         prose-headings:text-gray-900 
                         prose-p:mb-5 prose-strong:text-gray-900 prose-ul:list-disc prose-ul:pl-5
                         prose-a:text-[#fd572b] prose-a:font-medium hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />

            <hr className="my-10 border-gray-200" />

            {/* Bottom Close Button */}
            <div className="flex justify-center my-8">
              <button
                onClick={onClose}
                className="h-9 flex flex-shrink-0 px-3 justify-center items-center gap-2 rounded-full bg-gray-200 hover:bg-gray-300 border border-transparent transition-all duration-[400ms] active:scale-95 text-gray-700 hover:text-black group overflow-hidden shadow-sm focus:outline-none"
                aria-label="Voltar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 flex-shrink-0 group-hover:-translate-x-0.5 transition-transform duration-[400ms]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <span className="text-[11px] font-poppins font-bold uppercase tracking-wider mt-[1px]">Voltar</span>
              </button>
            </div>

            <div className="h-10"></div> {/* Safe area spacer */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;