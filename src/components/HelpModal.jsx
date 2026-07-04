import React from 'react';
import { X, Info, Gamepad2, Settings, MessageCircle, Monitor } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function HelpModal({ isOpen, onClose }) {
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  const isAr = language === 'ar';

  const activeContent = {
    title: t('help_title'),
    intro: t('help_intro'),
    sections: [
      {
        icon: <Gamepad2 size={24} className="text-blue-400" />,
        title: t('help_sec1_title'),
        text: t('help_sec1_text')
      },
      {
        icon: <MessageCircle size={24} className="text-purple-400" />,
        title: t('help_sec2_title'),
        text: t('help_sec2_text')
      },
      {
        icon: <Monitor size={24} className="text-emerald-400" />,
        title: t('help_sec3_title'),
        text: t('help_sec3_text')
      },
      {
        icon: <Settings size={24} className="text-amber-400" />,
        title: t('help_sec4_title'),
        text: t('help_sec4_text')
      }
    ]
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 animate-fade-in" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0a111a]/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
              <Info size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white">{activeContent.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-red-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <p className="text-lg text-white/80 leading-relaxed mb-8">
            {activeContent.intro}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeContent.sections.map((sec, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-black/40 rounded-xl group-hover:scale-110 transition-transform">
                    {sec.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">{sec.title}</h3>
                </div>
                <p className="text-white/60 leading-relaxed">
                  {sec.text}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
