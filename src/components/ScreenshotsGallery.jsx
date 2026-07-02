import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function ScreenshotsGallery() {
  const [screenshots, setScreenshots] = useState([]);

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
          <p className="text-sm">They will appear here once saved in the app's screenshots directory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {screenshots.map((url, i) => (
            <div key={i} className="group aspect-video bg-[#1a1a1a] rounded-lg overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] shadow-xl cursor-pointer">
              <img src={url} alt={`Screenshot ${i}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
