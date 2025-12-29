import React from 'react';

interface OnboardingProps {
  onDismiss: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onDismiss }) => {
  return (
    <div
      onClick={onDismiss}
      className="absolute inset-0 z-50 bg-black/85 flex flex-col items-center justify-center text-white text-center p-8 cursor-pointer animate-fade-in backdrop-blur-sm"
    >
      <h2 className="text-3xl font-poppins font-bold mb-12 text-[#fd572b]">Como Navegar</h2>

      <div className="flex flex-col gap-12 w-full max-w-md">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="text-4xl">▲</div>
          <p className="font-bold tracking-wider text-xl">ARRASTE PARA CIMA</p>
          <p className="text-sm text-white/70">Para ver a próxima notícia</p>
        </div>

        <div className="w-16 h-px bg-white/20 mx-auto"></div>

        <div className="flex flex-col items-center gap-3 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <div className="text-4xl">▶</div>
          <p className="font-bold tracking-wider text-xl">ARRASTE PARA O LADO</p>
          <p className="text-sm text-white/70">Para ver mais detalhes</p>
        </div>
      </div>

      <p className="absolute bottom-10 text-sm text-white/50 font-medium">Toque em qualquer lugar para começar</p>
    </div>
  );
};

export default Onboarding;