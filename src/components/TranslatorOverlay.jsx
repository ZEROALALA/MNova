import React, { useState, useEffect } from 'react';
import { translator } from '../services/translator';
import { Loader2, Languages, X } from 'lucide-react';

export default function TranslatorOverlay() {
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for translation triggers from the main process
    const handleStartTranslation = async (base64Image) => {
      setIsVisible(true);
      setIsTranslating(true);
      setTranslatedText('');

      const resultText = await translator.translateImage(base64Image);
      
      setTranslatedText(resultText);
      setIsTranslating(false);

      // Auto-hide if no text was found (3s), or after reading (15s)
      if (!resultText) {
        setTimeout(() => closeOverlay(), 3000);
      } else {
        setTimeout(() => closeOverlay(), 15000);
      }
    };

    if (window.electronAPI && window.electronAPI.onStartTranslation) {
      window.electronAPI.onStartTranslation(handleStartTranslation);
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeOverlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        const el = document.getElementById('translator-content');
        if (el && window.electronAPI && window.electronAPI.resizeOverlay) {
          const rect = el.getBoundingClientRect();
          window.electronAPI.resizeOverlay(rect.width, rect.height);
        }
      }, 50);
    }
  }, [isVisible, translatedText, isTranslating]);

  const closeOverlay = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (window.electronAPI) window.electronAPI.closeOverlay();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <>
      <style>{`html, body { background: transparent !important; overflow: hidden; }`}</style>
      <div id="translator-content" className="w-full flex flex-col items-end justify-end animate-[fade-in_0.3s_ease-out]">
        <div className="relative w-full pointer-events-none">
          <div className="relative w-full bg-black/60 backdrop-blur-2xl border-t border-white/20 p-6 md:p-8 shadow-[0_-10px_50px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-70"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-40 bg-cyan-500/20 rounded-full blur-[80px]"></div>
          
          <button onClick={closeOverlay} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-10">
            <X size={24} />
          </button>

          <div className="flex items-center gap-6 max-w-screen-2xl mx-auto relative z-10">
            <div className="p-4 bg-white/10 rounded-2xl shrink-0">
              {isTranslating ? (
                <Loader2 className="animate-spin text-cyan-400" size={28} />
              ) : (
                <Languages className="text-yellow-400" size={28} />
              )}
            </div>
            
            <div className="flex-1 pt-1" dir="rtl">
              {isTranslating ? (
                <div className="space-y-3">
                  <h3 className="text-white/60 text-lg font-medium">جاري فحص الشاشة والترجمة...</h3>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full w-1/2 rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-white/40 text-sm font-medium mb-2 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                    الترجمة الفورية
                  </h3>
                  {translatedText ? (
                    <p className="text-white text-2xl md:text-3xl font-medium leading-relaxed drop-shadow-md">
                      {translatedText}
                    </p>
                  ) : (
                    <p className="text-white/50 text-xl">
                      لم يتم العثور على أي نص في الشاشة. تأكد من ظهور حوار أو نص واضح في اللعبة.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
