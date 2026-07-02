import React from 'react';
import { Upload, Image, Film } from 'lucide-react';
import { api } from '../services/api';

export default function MediaUploader({ label, accept, onFileSelect, icon: Icon = Upload }) {
  const handleClick = async () => {
    try {
      let fileUrl = null;
      if (accept && accept.includes('video')) {
        fileUrl = await api.pickVideo();
      } else if (accept && accept.includes('audio')) {
        fileUrl = await api.pickAudio();
      } else {
        fileUrl = await api.pickImage();
      }

      if (fileUrl) {
        // We pass the URL directly instead of a File object
        onFileSelect(fileUrl);
      }
    } catch (err) {
      console.error('Failed to pick file:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex flex-col items-center justify-center gap-3 w-full h-40 rounded-xl border-2 border-dashed border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
    >
      <Icon size={28} className="text-white/40 group-hover:text-white/80 transition-colors" />
      <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors font-medium">
        {label}
      </span>
    </button>
  );
}
