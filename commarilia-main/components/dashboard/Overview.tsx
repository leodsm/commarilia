import React from 'react';
import { Layers, Image as ImageIcon, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Overview: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Stories Publicados</p>
            <h3 className="text-2xl font-bold text-gray-800">12</h3>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-full bg-pink-50 text-[#f4268e] flex items-center justify-center mr-4">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cards Gerados</p>
            <h3 className="text-2xl font-bold text-gray-800">48</h3>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/dashboard/stories/new" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-[#350285] hover:bg-gray-50 transition-colors group">
            <div className="h-10 w-10 rounded bg-[#350285]/10 text-[#350285] flex items-center justify-center mr-4 group-hover:bg-[#350285] group-hover:text-white transition-colors">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Criar Novo Story</h4>
              <p className="text-sm text-gray-500">Crie uma nova publicação com múltiplos slides.</p>
            </div>
          </Link>
          
          <Link to="/dashboard/card-builder" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-[#f4268e] hover:bg-gray-50 transition-colors group">
            <div className="h-10 w-10 rounded bg-[#f4268e]/10 text-[#f4268e] flex items-center justify-center mr-4 group-hover:bg-[#f4268e] group-hover:text-white transition-colors">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Gerar Card</h4>
              <p className="text-sm text-gray-500">Crie imagens personalizadas usando nossos templates.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Overview;
