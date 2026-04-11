import React, { useEffect, useRef, useCallback } from 'react';
import { TransformedStory } from '../types';
import { trackModalOpen, trackModalClose, trackModalComplete } from '../services/analytics';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: TransformedStory | null;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, story }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollDepthRef = useRef(0);
  const completedRef = useRef(false);

  // Track scroll depth for analytics
  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    if (pct > scrollDepthRef.current) {
      scrollDepthRef.current = pct;
    }
    if (pct >= 90 && !completedRef.current && story) {
      completedRef.current = true;
      trackModalComplete(story.id, story.title);
    }
  }, [story]);

  const handleClose = useCallback(() => {
    if (story) trackModalClose(story.id, scrollDepthRef.current);
    scrollDepthRef.current = 0;
    completedRef.current = false;
    onClose();
  }, [story, onClose]);

  useEffect(() => {
    if (isOpen && story) {
      trackModalOpen(story.id, story.title, story.category);
      scrollDepthRef.current = 0;
      completedRef.current = false;
      document.body.style.overflow = 'hidden';
      setTimeout(() => { contentRef.current?.focus(); }, 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, story]);

  if (!isOpen || !story) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      ></div>

      {/* Content Panel - Slide Up Animation */}
      <div className="relative bg-[#fffaf5] w-full h-[90vh] md:h-auto md:max-h-[90vh] md:max-w-2xl rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-slide-up">

        {/* Orange Ticket Header */}
        <div className="bg-[#fd572b] shrink-0 pt-3 pb-6 px-6 md:px-8 rounded-b-2xl shadow-lg relative z-20">
          {/* Drag handle (mobile only) */}
          <div className="w-12 h-1 bg-white/40 rounded-full mx-auto mb-4 md:hidden"></div>

          {/* Back icon + Title inline */}
          <div className="flex items-start gap-3">
            <button
              onClick={handleClose}
              className="flex-shrink-0 mt-1 w-7 h-7 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-all duration-200 active:scale-95 focus:outline-none"
              aria-label="Voltar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-white font-poppins leading-tight drop-shadow-sm">
              {story.title}
            </h2>
          </div>

          {/* Category Badge — bridges the bottom edge */}
          <span className="absolute -bottom-3.5 right-6 md:right-8 inline-block px-4 py-1.5 text-xs font-bold text-white bg-black border-[3px] border-[#fffaf5] rounded-full uppercase tracking-wide shadow-md z-30">
            {story.category}
          </span>
        </div>

        {/* Scrollable Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain outline-none bg-[#fffaf5]"
          tabIndex={-1}
          onScroll={handleScroll}
        >
          <div className="p-6 md:p-8 pt-8">
            <div
              className="custom-prose-content prose prose-lg max-w-none text-gray-800 font-inter leading-relaxed whitespace-pre-line
                         prose-headings:text-gray-900 
                         prose-p:mb-4 prose-strong:text-gray-900 prose-ul:list-disc prose-ul:pl-5
                         prose-a:text-[#fd572b] prose-a:font-medium hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />

            <hr className="my-8 border-gray-200" />

            {/* Bottom Close Button */}
            <div className="flex justify-center my-8">
              <button
                onClick={handleClose}
                className="h-8 flex flex-shrink-0 px-2 justify-center hover:px-3 hover:pr-4 items-center gap-0 hover:gap-1.5 rounded-full bg-gray-200 hover:bg-gray-300 border border-transparent transition-all duration-[400ms] active:scale-95 text-gray-700 hover:text-black group overflow-hidden shadow-sm focus:outline-none"
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