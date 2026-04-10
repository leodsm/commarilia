import React, { useRef, useState } from 'react';
import { Download, LayoutTemplate } from 'lucide-react';
import { toPng } from 'html-to-image';
import { TemplateCapita } from './TemplateCapita';

export const CardBuilder: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!containerRef.current) return;
    setExporting(true);
    
    try {
      const cards = containerRef.current.querySelectorAll('.export-card');
      if (cards.length === 0) {
        alert('Nenhum card encontrado para exportar.');
        return;
      }

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        const dataUrl = await toPng(card, {
          quality: 0.95,
          pixelRatio: 2, // High DPI for good export quality
          cacheBust: true,
        });

        const link = document.createElement('a');
        link.download = `card-${i + 1}.png`;
        link.href = dataUrl;
        link.click();
        
        // Small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error('Failed to export image', err);
      alert('Erro ao exportar as imagens. Verifique os logs.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 text-[#f4268e] bg-[#f4268e]/10 rounded-lg flex items-center justify-center">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Criador de Cards</h2>
            <p className="text-sm text-gray-500">Desenvolva stories visualmente</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 bg-gray-50 outline-none focus:border-[#350285]">
            <option value="capita">Capital do Alimento</option>
            <option value="curiosidades">Curiosidades</option>
            <option value="historicos">Fatos Históricos</option>
            {/* Add others later */}
          </select>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 bg-gradient-to-r from-[#350285] to-[#f4268e] text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exportando...' : 'Exportar PNGs'}
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="bg-gray-100 p-8 rounded-xl border border-gray-200 overflow-x-auto min-h-[600px]"
      >
        <TemplateCapita />
      </div>
    </div>
  );
};

export default CardBuilder;
