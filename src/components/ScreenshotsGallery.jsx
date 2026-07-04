import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function ScreenshotsGallery() {
  const [screenshots, setScreenshots] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    async function loadScreenshots() {
      if (api.isElectron) {
        const imgs = await api.getScreenshots();
        setScreenshots(imgs);
      }
    }
    loadScreenshots();
  }, []);

  return (
    <div className="pt-24 px-10 pb-10 w-full h-full overflow-y-auto custom-scrollbar relative z-10 bg-gradient-to-b from-transparent to-[#02050a]/90">
      <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">Captures & Screenshots</h1>
      {screenshots.length === 0 ? (
        <div className="text-white/50 text-center mt-20">
          <p className="text-xl mb-2">No screenshots found.</p>
          <p className="text-sm">
            They will appear here once saved in the app's screenshots directory.
          </p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 pb-20">
          {screenshots.map((img, i) => (
            <div
              key={i}
              onClick={() => setSelectedImage(img)}
              className="group relative bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(0,229,255,0.2)] shadow-xl cursor-pointer break-inside-avoid"
            >
              <img
                src={img.url || img}
                alt={`Screenshot ${i}`}
                className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white font-bold tracking-widest text-sm drop-shadow-md">
                  {img.title || 'SCREENSHOT'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex flex-col justify-center items-center p-8 animate-[fade-in_0.3s_ease-out]"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-4 rounded-full hover:bg-white/10"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
          <img
            src={selectedImage.url || selectedImage}
            alt="Fullscreen"
            className="max-w-full max-h-[85vh] rounded-xl shadow-[0_0_80px_rgba(0,0,0,1)] border border-white/10"
            onClick={(e) => e.stopPropagation()}
          />
          <h2 className="text-white mt-6 font-bold text-xl tracking-widest">
            {selectedImage.title || 'SCREENSHOT'}
          </h2>
        </div>
      )}
    </div>
  );
}
