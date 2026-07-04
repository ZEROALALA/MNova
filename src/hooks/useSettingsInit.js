import { useState, useEffect } from 'react';
import { storage } from '../services/storage';

export default function useSettingsInit() {
  const [appHue, setAppHue] = useState(0);
  const [activeTheme, setActiveTheme] = useState(() => storage.getTheme());
  const [aiVoice, setAiVoice] = useState('female');

  const handleThemeChange = (theme, setFocusedRegion, setShowStartup) => {
    setActiveTheme(theme);
    storage.saveTheme(theme);
    if (setFocusedRegion) setFocusedRegion('CAROUSEL');
    if (setShowStartup) setShowStartup(true);
  };

  useEffect(() => {
    const initSettings = () => {
      const savedHue = localStorage.getItem('app_hue');
      if (savedHue) setAppHue(parseInt(savedHue, 10));

      const savedTheme = localStorage.getItem('mnova_theme');
      if (savedTheme) setActiveTheme(savedTheme);
      
      let savedGroqKey = localStorage.getItem('groq_api_key');
      
      // Restore from persistent file storage if available
      if (window.electronAPI && window.electronAPI.getSettings) {
        window.electronAPI.getSettings().then(settings => {
          if (settings.groq_api_key) {
            localStorage.setItem('groq_api_key', settings.groq_api_key);
            savedGroqKey = settings.groq_api_key;
            if (window.electronAPI.setGroqKey) window.electronAPI.setGroqKey(savedGroqKey);
          }
          if (settings.openrouter_api_key) {
            localStorage.setItem('openrouter_api_key', settings.openrouter_api_key);
          }
          if (settings.translation_language) {
            localStorage.setItem('translation_language', settings.translation_language);
          }
          if (settings.ai_language) {
            localStorage.setItem('ai_language', settings.ai_language);
          }
        });
      } else if (savedGroqKey && window.electronAPI && window.electronAPI.setGroqKey) {
        window.electronAPI.setGroqKey(savedGroqKey);
      }

      const savedVoice = localStorage.getItem('ai_voice');
      if (savedVoice) {
        setAiVoice(savedVoice);
        import('../services/maryamApi').then(({ maryamApi }) => {
          maryamApi.setIdentity(savedVoice);
        });
      }
    };
    initSettings();
  }, []);

  return {
    appHue,
    setAppHue,
    activeTheme,
    handleThemeChange,
    aiVoice,
    setAiVoice
  };
}
