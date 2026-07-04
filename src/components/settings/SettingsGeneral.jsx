import React from 'react';
import { Globe, Bell, Monitor, Save } from 'lucide-react';

export default function SettingsGeneral({
  t,
  language,
  setLanguage,
  notifications,
  setNotifications,
  hardwareAcc,
  setHardwareAcc,
  playConfirm
}) {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-2">{t('settings_gen_title')}</h1>
      <p className="text-white/50 mb-8">{t('settings_gen_desc')}</p>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Globe className="text-white" size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold">{t('settings_language')}</h4>
              <p className="text-white/50 text-sm">
                {language === 'ar' ? 'Change app interface language' : 'تغيير لغة التطبيق'}
              </p>
            </div>
          </div>
          
          <select
            value={language}
            onChange={(e) => {
              playConfirm?.();
              setLanguage(e.target.value);
            }}
            className="px-4 py-2 bg-black/50 text-white font-bold border border-white/20 rounded-xl outline-none focus:border-blue-500 cursor-pointer appearance-none min-w-[200px]"
          >
            <option value="ar">العربية (Arabic)</option>
            <option value="en">English (الإنجليزية)</option>
            <option value="es">Spanish (الإسبانية)</option>
            <option value="fr">French (الفرنسية)</option>
            <option value="de">German (الألمانية)</option>
            <option value="ja">Japanese (اليابانية)</option>
            <option value="ko">Korean (الكورية)</option>
            <option value="ru">Russian (الروسية)</option>
          </select>
        </div>

        <div
          className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer"
          onClick={() => setNotifications(!notifications)}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Bell className="text-white" size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold">{t('settings_push')}</h4>
              <p className="text-white/50 text-sm">{t('settings_push_desc')}</p>
            </div>
          </div>
          <div
            className={`w-12 h-6 rounded-full relative transition-colors ${notifications ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/20'}`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? (language === 'ar' ? 'left-1' : 'right-1') : language === 'ar' ? 'right-1' : 'left-1'}`}
            ></div>
          </div>
        </div>

        <div
          className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer"
          onClick={() => setHardwareAcc(!hardwareAcc)}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Monitor className="text-white" size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold">{t('settings_accel')}</h4>
              <p className="text-white/50 text-sm">{t('settings_accel_desc')}</p>
            </div>
          </div>
          <div
            className={`w-12 h-6 rounded-full relative transition-colors ${hardwareAcc ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/20'}`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${hardwareAcc ? (language === 'ar' ? 'left-1' : 'right-1') : language === 'ar' ? 'right-1' : 'left-1'}`}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button
          onClick={() => playConfirm?.()}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          <Save size={20} /> {t('settings_save')}
        </button>
      </div>
    </div>
  );
}
