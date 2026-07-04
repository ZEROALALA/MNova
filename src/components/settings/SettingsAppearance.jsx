import React from 'react';
import { Palette, LayoutGrid } from 'lucide-react';

export default function SettingsAppearance({ 
  t, 
  language, 
  currentHue, 
  setHue, 
  dynamicBg, 
  handleToggleDynamicBg, 
  playConfirm 
}) {
  const THEMES = [
    {
      id: 'default',
      name: t('settings_menu') === 'Settings Menu' ? 'Cosmic Blue' : 'أزرق كوني',
      hue: 0,
      color: 'bg-blue-500',
    },
    {
      id: 'cyberpunk',
      name: t('settings_menu') === 'Settings Menu' ? 'Neon Purple' : 'بنفسجي نيون',
      hue: 45,
      color: 'bg-fuchsia-500',
    },
    {
      id: 'toxic',
      name: t('settings_menu') === 'Settings Menu' ? 'Toxic Green' : 'أخضر سام',
      hue: 270,
      color: 'bg-emerald-500',
    },
    {
      id: 'blood',
      name: t('settings_menu') === 'Settings Menu' ? 'Blood Red' : 'أحمر قاني',
      hue: 140,
      color: 'bg-red-500',
    },
    {
      id: 'gold',
      name: t('settings_menu') === 'Settings Menu' ? 'Royal Gold' : 'ذهبي ملكي',
      hue: 200,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-2">{t('settings_app_title')}</h1>
      <p className="text-white/50 mb-8">{t('settings_app_desc')}</p>

      <div className="mb-10">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Palette className="text-blue-400" /> {t('settings_accent')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                playConfirm?.();
                setHue(theme.hue);
              }}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
                currentHue === theme.hue
                  ? 'border-blue-500 bg-blue-500/10 scale-105 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full ${theme.color} shadow-lg shadow-black/50 border-2 border-white/20`}
              ></div>
              <span className="text-white font-bold text-sm text-center">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <LayoutGrid className="text-blue-400" /> {t('settings_layout')}
        </h3>
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
          <div>
            <h4 className="text-white font-bold">{t('settings_bg')}</h4>
            <p className="text-white/50 text-sm">{t('settings_bg_desc')}</p>
          </div>
          <div
            onClick={handleToggleDynamicBg}
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
              dynamicBg ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/20'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                dynamicBg
                  ? language === 'ar'
                    ? 'left-1'
                    : 'right-1'
                  : language === 'ar'
                  ? 'right-1'
                  : 'left-1'
              }`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
