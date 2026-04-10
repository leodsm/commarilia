import React, { useEffect } from 'react';

interface OnboardingProps {
  onDismiss: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onDismiss }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 cursor-pointer animate-fade-in bg-black/60 backdrop-blur-md"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm gap-10">
        
        {/* Brand Logo */}
        <div className="absolute -top-20">
            <h1 className="text-white text-3xl font-poppins font-bold drop-shadow-md">
                Com<span className="text-[#fd572b]">Marília</span>
            </h1>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center">
            <h2 className="text-4xl font-poppins font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-2 drop-shadow-lg scale-105">
              Como Navegar
            </h2>
            <div className="h-1 w-16 bg-[#fd572b] rounded-full shadow-[0_0_15px_#fd572b]"></div>
        </div>

        {/* Instructions Card */}
        <div className="w-full flex flex-col gap-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            
            {/* Swipe Up */}
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-white/20 to-white/5 flex items-center justify-center border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-[#fd572b]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
                    </svg>
                </div>
                <div className="text-center">
                    <p className="font-poppins font-bold tracking-widest text-white/90 text-lg uppercase mb-1 drop-shadow-md">Arraste para Cima</p>
                    <p className="text-sm text-gray-400 font-inter">Para ver a próxima notícia</p>
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            {/* Swipe Left/Right */}
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-white/20 to-white/5 flex items-center justify-center border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] shadow-[#fd572b]/20" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-[#fd572b]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                </div>
                <div className="text-center">
                    <p className="font-poppins font-bold tracking-widest text-white/90 text-lg uppercase mb-1 drop-shadow-md">Arraste para o Lado</p>
                    <p className="text-sm text-gray-400 font-inter">Para ver mais detalhes</p>
                </div>
            </div>
            
        </div>
      </div>

      <div className="absolute bottom-10 w-full text-center">
        <p className="text-sm text-white/60 font-medium tracking-wide uppercase animate-pulse">Toque na tela para começar</p>
      </div>
    </div>
  );
};

export default Onboarding;