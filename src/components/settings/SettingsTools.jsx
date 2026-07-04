import React from 'react';
import { Mic, MessageSquare, Monitor, Cpu, BarChart3, Search, Power } from 'lucide-react';
import { api } from '../../services/api';

export default function SettingsTools({
  t,
  language,
  groqKey,
  setGroqKey,
  openRouterKey,
  setOpenRouterKey,
  translationLang,
  setTranslationLang,
  aiLang,
  setAiLang,
  aiVoice,
  setAiVoice,
  playConfirm
}) {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-2">{t('settings_sys_tools')}</h1>
      <p className="text-white/50 mb-8">{t('settings_sys_tools_desc')}</p>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">{t('settings_groq_title')}</h3>
          <button
            onClick={() => window.open('https://console.groq.com/keys', '_blank')}
            className="text-sm px-3 py-1 bg-purple-500/20 text-purple-400 hover:bg-purple-500/40 border border-purple-500/30 rounded-lg transition-colors"
          >
            {t('settings_get_key')}
          </button>
        </div>
        <p className="text-white/50 text-sm mb-4">
          {t('settings_groq_desc')}
        </p>
        <div className="flex gap-2">
          <input 
            type="password"
            value={groqKey}
            onChange={(e) => {
              const val = e.target.value;
              setGroqKey(val);
              localStorage.setItem('groq_api_key', val.trim());
              if (window.electronAPI && window.electronAPI.setGroqKey) {
                window.electronAPI.setGroqKey(val.trim());
                if (window.electronAPI.saveSettings) {
                  window.electronAPI.saveSettings({ groq_api_key: val.trim() });
                }
              }
            }}
            placeholder="gsk_..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
          />
          <button 
            onClick={() => {
              playConfirm?.();
              if (groqKey.trim()) {
                localStorage.setItem('groq_api_key', groqKey.trim());
                if (window.electronAPI && window.electronAPI.setGroqKey) {
                  window.electronAPI.setGroqKey(groqKey.trim());
                }
              }
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
          >
            {t('settings_save_btn')}
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">{t('settings_openrouter_title')}</h3>
          <button
            onClick={() => window.open('https://openrouter.ai/keys', '_blank')}
            className="text-sm px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 border border-blue-500/30 rounded-lg transition-colors"
          >
            {t('settings_get_key')}
          </button>
        </div>
        <p className="text-white/50 text-sm mb-4">
          {t('settings_openrouter_desc')}
        </p>
        <div className="flex gap-2">
          <input 
            type="password"
            value={openRouterKey}
            onChange={(e) => {
              const val = e.target.value;
              setOpenRouterKey(val);
              localStorage.setItem('openrouter_api_key', val.trim());
              if (window.electronAPI && window.electronAPI.saveSettings) {
                window.electronAPI.saveSettings({ openrouter_api_key: val.trim() });
              }
            }}
            placeholder="sk-or-v1-..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />
          <button 
            onClick={() => {
              playConfirm?.();
              if (openRouterKey.trim()) {
                localStorage.setItem('openrouter_api_key', openRouterKey.trim());
              }
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
          >
            {t('settings_save_btn')}
          </button>
        </div>

        {/* Translation Language Picker */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-white font-bold mb-2">
            {t('settings_trans_lang_title')}
          </h4>
          <p className="text-white/50 text-sm mb-4">
            {t('settings_trans_lang_desc')}
          </p>
          <div className="flex gap-2">
            <select
              value={translationLang}
              onChange={(e) => {
                const val = e.target.value;
                setTranslationLang(val);
                localStorage.setItem('translation_language', val);
                if (window.electronAPI && window.electronAPI.saveSettings) {
                  window.electronAPI.saveSettings({ translation_language: val });
                }
                playConfirm?.();
              }}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="Arabic">العربية (Arabic)</option>
              <option value="English">English (الإنجليزية)</option>
              <option value="Spanish">Spanish (الإسبانية)</option>
              <option value="French">French (الفرنسية)</option>
              <option value="German">German (الألمانية)</option>
              <option value="Japanese">Japanese (اليابانية)</option>
              <option value="Korean">Korean (الكورية)</option>
              <option value="Russian">Russian (الروسية)</option>
            </select>
          </div>
        </div>

        {/* AI Language Selection */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
          <div>
            <h4 className="text-white font-medium">{t('settings_ai_lang_title')}</h4>
            <p className="text-white/50 text-xs">{t('settings_ai_lang_desc')}</p>
          </div>
          <div className="flex gap-2">
            <select
              value={aiLang}
              onChange={(e) => {
                const val = e.target.value;
                setAiLang(val);
                localStorage.setItem('ai_language', val);
                if (window.electronAPI && window.electronAPI.saveSettings) {
                  window.electronAPI.saveSettings({ ai_language: val });
                }
                playConfirm?.();
              }}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="en">English (الإنجليزية)</option>
              <option value="ar">العربية (Arabic)</option>
              <option value="es">Spanish (الإسبانية)</option>
              <option value="fr">French (الفرنسية)</option>
              <option value="de">German (الألمانية)</option>
              <option value="ja">Japanese (اليابانية)</option>
              <option value="ko">Korean (الكورية)</option>
              <option value="ru">Russian (الروسية)</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Voice Selection */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Mic size={20} className="text-purple-400" />
          {t('settings_ai_voice_title')}
        </h3>
        <p className="text-white/50 text-sm mb-6">
          {t('settings_ai_voice_desc')}
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => {
              playConfirm?.();
              setAiVoice('female');
              localStorage.setItem('ai_voice', 'female');
              import('../../services/maryamApi').then(({ maryamApi }) => maryamApi.setIdentity('female'));
            }}
            className={`relative p-4 rounded-xl border cursor-pointer transition-all ${aiVoice === 'female' ? 'bg-purple-500/20 border-purple-500' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">
                <MessageSquare className="text-purple-400" size={18} />
              </div>
              <span className="text-white font-bold text-lg">Maryam</span>
            </div>
            <p className="text-white/60 text-sm">{language === 'ar' ? 'صوت أنثوي هادئ' : 'Calm Female Voice'}</p>
            {aiVoice === 'female' && <div className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]`}></div>}
          </div>

          <div 
            onClick={() => {
              playConfirm?.();
              setAiVoice('male');
              localStorage.setItem('ai_voice', 'male');
              import('../../services/maryamApi').then(({ maryamApi }) => maryamApi.setIdentity('male'));
            }}
            className={`relative p-4 rounded-xl border cursor-pointer transition-all ${aiVoice === 'male' ? 'bg-cyan-500/20 border-cyan-500' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-cyan-500/30 flex items-center justify-center">
                <Monitor className="text-cyan-400" size={18} />
              </div>
              <span className="text-white font-bold text-lg">MNova</span>
            </div>
            <p className="text-white/60 text-sm">{language === 'ar' ? 'صوت تقني ذكوري' : 'Tech Male Voice'}</p>
            {aiVoice === 'male' && <div className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]`}></div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => { playConfirm?.(); alert(language === 'ar' ? 'سيتم توفير هذه الميزة قريباً' : 'Coming soon...'); }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30 text-cyan-400">
            <Cpu size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{language === 'ar' ? 'مراقبة الأداء' : 'System Monitor'}</h3>
            <p className="text-white/50 text-sm">{language === 'ar' ? 'استهلاك المعالج والذاكرة' : 'CPU and RAM usage stats'}</p>
          </div>
        </div>

        <div 
          onClick={() => { playConfirm?.(); alert(language === 'ar' ? 'سيتم توفير هذه الميزة قريباً' : 'Coming soon...'); }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30 text-blue-400">
            <BarChart3 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{language === 'ar' ? 'إحصائيات اللعب' : 'Play Stats'}</h3>
            <p className="text-white/50 text-sm">{language === 'ar' ? 'ساعات اللعب والإنجازات' : 'Playtime and achievements'}</p>
          </div>
        </div>

        <div 
          onClick={() => { playConfirm?.(); alert(language === 'ar' ? 'سيتم توفير هذه الميزة قريباً' : 'Coming soon...'); }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 text-white">
            <Search size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{language === 'ar' ? 'البحث الشامل' : 'Global Search'}</h3>
            <p className="text-white/50 text-sm">{language === 'ar' ? 'ابحث في مكتبتك والمتاجر' : 'Search your library and stores'}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-white/10 pt-8">
         <div 
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center justify-between hover:bg-red-500/20 transition-colors cursor-pointer"
          onClick={() => { playConfirm?.(); api.quit(); }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
              <Power size={24} />
            </div>
            <div>
              <h3 className="font-bold text-red-400 text-lg">{language === 'ar' ? 'إغلاق التطبيق' : 'Exit Application'}</h3>
              <p className="text-red-400/70 text-sm">{language === 'ar' ? 'الخروج مع الإبقاء على ميزات الخلفية' : 'Exit UI, keep background services running'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
