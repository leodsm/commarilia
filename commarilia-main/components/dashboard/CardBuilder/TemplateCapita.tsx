import React, { useState } from 'react';
import { UploadZone } from './UploadZone';
import { Camera, Leaf, Factory, TrendingUp, Globe, Landmark, Cookie } from 'lucide-react';

export const TemplateCapita: React.FC = () => {
  // Using local state to allow text editing makes it a true "builder"
  const [titleCapa, setTitleCapa] = useState('A Capital\ndo Alimento');
  const [subtitleCapa, setSubtitleCapa] = useState('O império dos sabores que nasceu no interior de São Paulo e conquistou o mundo.');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {/* CARD 1: CAPA */}
      <div className="w-full aspect-[9/16] relative bg-[#0F172A] rounded-xl overflow-hidden border border-gray-700 shadow-2xl export-card">
        <div className="absolute inset-0 z-0">
          <UploadZone promptText="Foto de Capa" icon={<Camera className="w-16 h-16" />} />
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end pb-[200px] px-10 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent">
          <textarea
            className="pointer-events-auto bg-transparent border-none outline-none text-white font-[Bebas Neue] font-display text-5xl md:text-6xl lg:text-7xl leading-[0.85] text-center tracking-wide uppercase resize-none overflow-hidden"
            value={titleCapa}
            onChange={(e) => setTitleCapa(e.target.value)}
            rows={2}
          />
          <textarea
            className="pointer-events-auto mt-6 bg-transparent border-none outline-none text-white/95 font-medium text-lg text-center resize-none overflow-hidden"
            value={subtitleCapa}
            onChange={(e) => setSubtitleCapa(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* CARD 2: CONTEXTO */}
      <div className="w-full aspect-[9/16] relative bg-[#0F172A] rounded-xl overflow-hidden border border-gray-700 shadow-2xl export-card">
        <div className="absolute inset-0 z-0">
          <UploadZone promptText="Foto de Lavouras" icon={<Leaf className="w-16 h-16" />} />
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end pb-[200px] px-10 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent text-left">
          <div className="border-l-8 border-[#2563EB] pl-6 pointer-events-auto">
            <h1 className="text-white font-[Bebas Neue] font-display text-5xl uppercase leading-[0.85]">Do Campo<br/>para a Indústria</h1>
            <p className="text-white/95 font-medium mt-4 text-base">Nas décadas de 20 e 30, o <strong>café e o algodão</strong> ditavam as regras da nossa economia local.</p>
            <p className="text-white/95 font-medium mt-4 text-base">Foi o espírito empreendedor que transformou as lavouras nas maiores esteiras de produção do país.</p>
          </div>
        </div>
      </div>

      {/* CARD 3: EMPRESAS */}
      <div className="w-full aspect-[9/16] relative bg-[#0F172A] rounded-xl overflow-hidden border border-gray-700 shadow-2xl export-card">
        <div className="absolute inset-0 z-0">
          <UploadZone promptText="Fábricas / Produtos" icon={<Factory className="w-16 h-16" />} />
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end pb-[200px] px-10 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent text-right">
          <div className="border-r-8 border-[#059669] pr-6 pointer-events-auto flex flex-col items-end">
            <h1 className="text-white font-[Bebas Neue] font-display text-5xl uppercase leading-[0.85] text-right">O Berço<br/>das Gigantes</h1>
            <p className="text-white/95 font-medium mt-4 text-base text-right">Marcas icônicas como <strong>Marilan, Dori e Bel Chocolates</strong> nasceram aqui.</p>
            <p className="text-white/95 font-medium mt-4 text-base text-right">O que era produção familiar virou um complexo que marca a infância dos brasileiros.</p>
          </div>
        </div>
      </div>

      {/* CARD 4: NUMEROS */}
      <div className="w-full aspect-[9/16] relative bg-[#0F172A] rounded-xl overflow-hidden border border-gray-700 shadow-2xl export-card">
        <div className="absolute inset-0 z-0">
          <UploadZone promptText="Linha de Produção" icon={<TrendingUp className="w-16 h-16" />} />
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-center items-center px-10 bg-[#0F172A]/80">
          <h1 className="text-[#D97706] font-[Bebas Neue] font-display text-7xl uppercase leading-[0.85] text-center pointer-events-auto">32 MIL</h1>
          <h2 className="text-white font-[Bebas Neue] font-display text-3xl font-normal leading-tight text-center mb-6 pointer-events-auto">Toneladas ao Mês</h2>
          <p className="text-white/95 font-medium text-center text-sm pointer-events-auto mb-3"><strong>Mais de 1.100 empresas</strong> do setor alimentício estão ativas na cidade.</p>
          <p className="text-white/95 font-medium text-center text-sm pointer-events-auto">Um volume colossal que movimenta e emprega milhares de pessoas.</p>
        </div>
      </div>
      
       {/* CARD 5: INTERNACIONAL */}
       <div className="w-full aspect-[9/16] relative bg-[#0F172A] rounded-xl overflow-hidden border border-gray-700 shadow-2xl export-card">
        <div className="absolute inset-0 z-0">
          <UploadZone promptText="Exportação / Mapa" icon={<Globe className="w-16 h-16" />} />
        </div>
         <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end pb-[200px] px-10 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent text-left">
          <div className="border-l-8 border-[#7C3AED] pl-6 pointer-events-auto">
            <h1 className="text-white font-[Bebas Neue] font-display text-5xl uppercase leading-[0.85]">Para os 5<br/>Continentes</h1>
            <p className="text-white/95 font-medium mt-4 text-base">As fronteiras do Brasil ficaram pequenas para a capacidade das nossas indústrias.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
