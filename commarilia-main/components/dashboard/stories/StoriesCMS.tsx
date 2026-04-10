import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data (would come from Supabase)
const MOCK_STORIES = [
  { id: '1', title: 'O Berço das Gigantes do Alimento', category: 'Indústria', views: 1250, status: 'published' },
  { id: '2', title: 'História do Vale do Silício Caipira', category: 'Tecnologia', views: 800, status: 'published' },
  { id: '3', title: 'Novos Investimentos na Saúde', category: 'Saúde', views: 0, status: 'draft' },
];

export const StoriesCMS: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStories = MOCK_STORIES.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Meus Stories</h2>
          <p className="text-sm text-gray-500">Gerencie e crie novas narrativas.</p>
        </div>
        
        <Link 
          to="/dashboard/stories/new" 
          className="bg-gradient-to-r from-[#350285] to-[#f4268e] text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Novo Story
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por título ou categoria..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#350285] text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">Título</th>
                <th className="p-4 font-semibold">Categoria</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Visualizações</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStories.map((story) => (
                <tr key={story.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-900 border-l-4 border-transparent hover:border-[#350285]">
                    {story.title}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{story.category}</span>
                  </td>
                  <td className="p-4 text-sm">
                    {story.status === 'published' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Publicado</span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Rascunho</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-500">{story.views.toLocaleString('pt-BR')}</td>
                  <td className="p-4 text-sm flex justify-end gap-2">
                    {story.status === 'published' && (
                      <a href={`/?story=${story.id}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-md transition-colors" title="Ver Publicado">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <Link to={`/dashboard/stories/${story.id}`} className="text-[#350285] hover:text-[#f4268e] bg-[#350285]/10 hover:bg-[#f4268e]/10 p-2 rounded-md transition-colors" title="Editar">
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredStories.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">
                    Nenhum story encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StoriesCMS;
