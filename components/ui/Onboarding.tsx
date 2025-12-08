import React from 'react';

interface OnboardingProps {
  onDismiss: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onDismiss }) => (
  <div 
    onClick={onDismiss}
    className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white cursor-pointer animate-in fade-in duration-500"
  >
    <h2 className="text-3xl font-poppins font-bold mb-12">Como Navegar</h2>
    <div className="space-y-10 text-center">
        <div>
            <div className="text-3xl animate-bounce mb-2">↑</div>
            <p className="font-bold">ARRASTE PARA CIMA</p>
            <p className="text-sm opacity-70">Próxima notícia</p>
        </div>
        <div>
            <div className="text-3xl animate-bounce mb-2">← →</div>
            <p className="font-bold">ARRASTE PARA O LADO</p>
            <p className="text-sm opacity-70">Mais detalhes</p>
        </div>
    </div>
    <p className="absolute bottom-10 text-sm opacity-50">Toque para começar</p>
  </div>
);
