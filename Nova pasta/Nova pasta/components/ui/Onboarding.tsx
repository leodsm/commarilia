import React from 'react';

interface OnboardingProps {
  onDismiss: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onDismiss }) => (
  <div
    onClick={onDismiss}
    className="animate-in fade-in duration-500 fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-black/90 text-white"
  >
    <h2 className="mb-12 font-poppins text-3xl font-bold">Como Navegar</h2>
    <div className="space-y-10 text-center">
      <div>
        <div className="mb-2 text-3xl animate-bounce">&uarr;</div>
        <p className="font-bold">ARRASTE PARA CIMA</p>
        <p className="text-sm opacity-70">Proxima noticia</p>
      </div>
      <div>
        <div className="mb-2 text-3xl animate-bounce">&larr; &rarr;</div>
        <p className="font-bold">ARRASTE PARA O LADO</p>
        <p className="text-sm opacity-70">Mais detalhes</p>
      </div>
    </div>
    <p className="absolute bottom-10 text-sm opacity-50">Toque para comecar</p>
  </div>
);