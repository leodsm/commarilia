import React, { useState, useRef } from 'react';
import { Camera, ZoomIn, ZoomOut, Edit2 } from 'lucide-react';

interface UploadZoneProps {
  icon?: React.ReactNode;
  promptText: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ icon, promptText }) => {
  const [image, setImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative w-full h-full bg-[#1E293B] overflow-hidden group flex flex-col items-center justify-center">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {image ? (
        <>
          <img
            src={image}
            alt="Uploaded"
            className="absolute pointer-events-none z-10 top-1/2 left-1/2"
            style={{
              transform: `translate(-50%, -50%) scale(${zoom})`,
              transformOrigin: 'center',
              filter: 'contrast(1.05) saturate(1.05)',
              maxWidth: 'none',
              maxHeight: 'none',
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'cover'
            }}
          />

          {/* Zoom Controls */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 hidden group-hover:flex bg-black/70 px-6 py-3 rounded-full backdrop-blur-md items-center gap-4 border border-white/20">
            <ZoomOut className="text-white w-5 h-5 cursor-pointer" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} />
            <input
              type="range"
              min="0.2"
              max="4"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-32 accent-[#FF5A26]"
            />
            <ZoomIn className="text-white w-5 h-5 cursor-pointer" onClick={() => setZoom(z => Math.min(4, z + 0.1))} />
          </div>

          {/* Edit Control */}
          <div className="absolute top-10 right-10 z-50 hidden group-hover:flex">
            <button
              onClick={triggerUpload}
              className="bg-black/60 backdrop-blur-md text-white w-12 h-12 rounded-full flex justify-center items-center border border-white/30 hover:bg-white/20 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
        </>
      ) : (
        <div 
          onClick={triggerUpload}
          className="cursor-pointer text-white/30 flex flex-col items-center gap-4 z-20 hover:text-white/50 transition-colors"
        >
          {icon || <Camera className="w-20 h-20" />}
          <span className="text-2xl font-bold uppercase tracking-widest">{promptText}</span>
        </div>
      )}
    </div>
  );
};
