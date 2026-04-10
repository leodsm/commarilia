import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

export const StoryEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [slides, setSlides] = useState([
    { id: '1', mediaUrl: '', slideLink: '', showButton: true }
  ]);

  const handleAddSlide = () => {
    setSlides([...slides, { id: Date.now().toString(), mediaUrl: '', slideLink: '', showButton: true }]);
  };

  const handleRemoveSlide = (slideId: string) => {
    if (slides.length === 1) return;
    setSlides(slides.filter(s => s.id !== slideId));
  };

  const updateSlide = (slideId: string, field: string, value: any) => {
    setSlides(slides.map(s => s.id === slideId ? { ...s, [field]: value } : s));
  };

  const handleSave = () => {
    // TODO: integrate with Supabase
    alert('Story salvo com sucesso (Mock)!');
    navigate('/dashboard/stories');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/stories" className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-xl font-bold text-gray-800">
            {isNew ? 'Criar Novo Story' : 'Editar Story'}
          </h2>
        </div>
        
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-gradient-to-r from-[#350285] to-[#f4268e] text-white px-6 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" />
          Salvar
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Informações Básicas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título do Story</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: A História do Algodão"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#f4268e] focus:border-[#f4268e] sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input 
              type="text" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Curiosidades"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#f4268e] focus:border-[#f4268e] sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Slides (Card Images ou Vídeos)</h3>
          <button 
            onClick={handleAddSlide}
            className="flex items-center gap-2 bg-white border border-[#350285] text-[#350285] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Slide
          </button>
        </div>

        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-6 relative group">
            <button 
              onClick={() => handleRemoveSlide(slide.id)}
              disabled={slides.length === 1}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="flex-shrink-0 w-32 h-48 bg-gray-100 rounded-md flex flex-col items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
              {slide.mediaUrl ? (
                <img src={slide.mediaUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500 font-medium text-center px-2">Upload Mídia</span>
                </>
              )}
            </div>

            <div className="flex-1 space-y-4 mt-2">
              <div className="flex items-center">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold mr-3">
                  Slide {index + 1}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> URL da Mídia (Storage Supabase)
                </label>
                <input 
                  type="text" 
                  value={slide.mediaUrl}
                  onChange={(e) => updateSlide(slide.id, 'mediaUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#f4268e] focus:border-[#f4268e] sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> Link do Botão "Leia Mais" (Opcional)
                </label>
                <input 
                  type="text" 
                  value={slide.slideLink}
                  onChange={(e) => updateSlide(slide.id, 'slideLink', e.target.value)}
                  placeholder="https://commarilia.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#f4268e] focus:border-[#f4268e] sm:text-sm"
                />
              </div>

              <div className="flex items-center mt-3">
                <input 
                  id={`show-btn-${slide.id}`} 
                  type="checkbox" 
                  checked={slide.showButton}
                  onChange={(e) => updateSlide(slide.id, 'showButton', e.target.checked)}
                  className="h-4 w-4 text-[#f4268e] focus:ring-[#f4268e] border-gray-300 rounded" 
                />
                <label htmlFor={`show-btn-${slide.id}`} className="ml-2 block text-sm text-gray-900">
                  Mostrar botão "Leia Mais"
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryEditor;
