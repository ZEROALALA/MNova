import React, { useState, useEffect } from 'react';
import {
  Settings,
  Palette,
  Link2,
  Bell,
  Globe,
  Monitor,
  Save,
  Gamepad2,
  Shield,
  LayoutGrid,
  LogOut,
  CheckCircle2,
  Wrench,
  Search,
  BarChart3,
  Cpu,
  MessageCircle,
  Power,
  LayoutDashboard,
  Mic,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { api } from '../services/api';
import SettingsAppearance from './settings/SettingsAppearance';
import SettingsAccounts from './settings/SettingsAccounts';
import SettingsGeneral from './settings/SettingsGeneral';
import SettingsTools from './settings/SettingsTools';

export default function SettingsTab({ playNav, playConfirm, currentHue, setHue, userProfile, onToggleMaryam, aiVoice, setAiVoice }) {
  const { t, language, setLanguage } = useLanguage();
  const [activeSection, setActiveSection] = useState('appearance');
  const [notifications, setNotifications] = useState(true);
  const [hardwareAcc, setHardwareAcc] = useState(true);
  const [groqKey, setGroqKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [translationLang, setTranslationLang] = useState('Arabic');
  const [aiLang, setAiLang] = useState('en');
  const [dynamicBg, setDynamicBg] = useState(() => localStorage.getItem('mnova_dynamic_bg') !== 'false');

  const handleToggleDynamicBg = () => {
    const val = !dynamicBg;
    setDynamicBg(val);
    localStorage.setItem('mnova_dynamic_bg', val);
    window.dispatchEvent(new Event('dynamicBgChanged'));
    playConfirm?.();
  };

  const [linkedAccounts, setLinkedAccounts] = useState({
    steam: localStorage.getItem('linked_steam'),
    epic: localStorage.getItem('linked_epic'),
    xbox: localStorage.getItem('linked_xbox'),
    ea: localStorage.getItem('linked_ea'),
  });

  const [linkingPlatform, setLinkingPlatform] = useState(null);
  const [linkingId, setLinkingId] = useState('');

  const handleLinkAccount = (platform) => {
    setLinkingPlatform(platform);
    setLinkingId('');
    playConfirm?.();
  };

  const unlinkAccount = (platform) => {
    const key = platform.split(' ')[0].toLowerCase();
    // Removed window.confirm because it freezes the Electron event loop
    localStorage.removeItem(`linked_${key}`);
    setLinkedAccounts(prev => ({ ...prev, [key]: null }));
    playConfirm?.();
  };

  const [isVerifying, setIsVerifying] = useState(false);

  const confirmLinkAccount = async () => {
    if (!linkingPlatform || !linkingId.trim() || isVerifying) return;
    
    setIsVerifying(true);
    const id = linkingId.trim();
    const p = linkingPlatform.toLowerCase();
    
    // Simulate network delay for verification realism
    await new Promise(r => setTimeout(r, 1500));
    
    // Validation
    let isValid = false;
    let errorMsg = language === 'ar' ? 'صيغة الحساب غير صحيحة.' : 'Invalid account format.';
    
    if (p.includes('steam')) {
      isValid = /^[a-zA-Z0-9_-]{3,32}$/.test(id);
      if (!isValid) errorMsg = language === 'ar' ? 'معرف Steam يجب أن يكون بين 3 و 32 حرفاً.' : 'Steam ID must be 3-32 characters.';
    } else if (p.includes('xbox')) {
      isValid = /^[a-zA-Z][a-zA-Z0-9 ]{2,14}$/.test(id);
      if (!isValid) errorMsg = language === 'ar' ? 'حساب Xbox غير صالح (أحرف وأرقام فقط، يبدأ بحرف، 3-15 طول).' : 'Invalid Xbox Gamertag (starts with letter, 3-15 chars).';
    } else if (p.includes('epic')) {
      isValid = /^[a-zA-Z0-9_ -]{3,16}$/.test(id);
      if (!isValid) errorMsg = language === 'ar' ? 'حساب Epic يجب أن يكون بين 3 و 16 حرفاً.' : 'Epic ID must be 3-16 characters.';
    } else if (p.includes('ea')) {
      isValid = /^[a-zA-Z0-9_-]{4,16}$/.test(id);
      if (!isValid) errorMsg = language === 'ar' ? 'حساب EA يجب أن يكون بين 4 و 16 حرفاً.' : 'EA ID must be 4-16 characters.';
    }

    if (!isValid) {
      alert(errorMsg);
      setIsVerifying(false);
      return;
    }

    const key = linkingPlatform.split(' ')[0].toLowerCase();
    localStorage.setItem(`linked_${key}`, id);
    setLinkedAccounts(prev => ({ ...prev, [key]: id }));
    setLinkingPlatform(null);
    setIsVerifying(false);
    playConfirm?.();
    
    try {
      const result = await api.syncStores(id);
      if (result && result.newGamesCount > 0) {
        alert(language === 'ar' ? `تم الربط بنجاح! تم العثور على ${result.newGamesCount} ألعاب.` : `Linked successfully! Found ${result.newGamesCount} games.`);
        window.location.reload();
      } else {
        alert(language === 'ar' ? `تم الربط بنجاح! لم يتم العثور على ألعاب جديدة محلياً.` : `Linked successfully! Scanning completed, no new games found locally.`);
      }
    } catch (e) {
      alert(language === 'ar' ? 'تم الربط! ولكن حدث خطأ أثناء المسح.' : 'Linked! But scanning failed.');
    }
  };

  useEffect(() => {
    const savedGroq = localStorage.getItem('groq_api_key');
    if (savedGroq) {
      setGroqKey(savedGroq);
      if (window.electronAPI && window.electronAPI.setGroqKey) {
        window.electronAPI.setGroqKey(savedGroq);
      }
    }
    
    const savedOpenRouter = localStorage.getItem('openrouter_api_key');
    if (savedOpenRouter) setOpenRouterKey(savedOpenRouter);

    const savedLang = localStorage.getItem('translation_language');
    if (savedLang) setTranslationLang(savedLang);

    const savedAi = localStorage.getItem('ai_language');
    if (savedAi) setAiLang(savedAi);
  }, []);


  const SECTIONS = [
    { id: 'appearance', label: t('settings_appearance'), icon: Palette },
    { id: 'accounts', label: t('settings_accounts'), icon: Link2 },
    { id: 'general', label: t('settings_general'), icon: Settings },
    { id: 'tools', label: language === 'ar' ? 'الأدوات والنظام' : 'Tools & System', icon: Wrench },
  ];

  return (
    <div className="pt-24 px-10 pb-0 w-full h-full flex gap-8 overflow-hidden relative z-10 bg-gradient-to-b from-[#050b14] to-[#000000]">
      {/* Sidebar Navigation */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar pb-10">
        <h2 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4 px-4">
          {t('settings_menu')}
        </h2>
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => {
              playNav?.();
              setActiveSection(sec.id);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeSection === sec.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <sec.icon size={20} />
            {sec.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl h-full overflow-y-auto custom-scrollbar pb-32 pr-4">
        {/* Appearance Section */}
        {activeSection === 'appearance' && (
          <SettingsAppearance 
            t={t}
            language={language}
            currentHue={currentHue}
            setHue={setHue}
            dynamicBg={dynamicBg}
            handleToggleDynamicBg={handleToggleDynamicBg}
            playConfirm={playConfirm}
          />
        )}

        {/* Linked Accounts Section */}
        {activeSection === 'accounts' && (
          <SettingsAccounts
            t={t}
            language={language}
            linkedAccounts={linkedAccounts}
            handleLinkAccount={handleLinkAccount}
            unlinkAccount={unlinkAccount}
            userProfile={userProfile}
            isVerifying={isVerifying}
            linkingPlatform={linkingPlatform}
            linkingId={linkingId}
            setLinkingId={setLinkingId}
            confirmLinkAccount={confirmLinkAccount}
          />
        )}

        {/* General Section */}
        {activeSection === 'general' && (
          <SettingsGeneral
            t={t}
            language={language}
            setLanguage={setLanguage}
            notifications={notifications}
            setNotifications={setNotifications}
            hardwareAcc={hardwareAcc}
            setHardwareAcc={setHardwareAcc}
            playConfirm={playConfirm}
          />
        )}

        {/* Tools & System Section */}
        {activeSection === 'tools' && (
          <SettingsTools
            t={t}
            language={language}
            groqKey={groqKey}
            setGroqKey={setGroqKey}
            openRouterKey={openRouterKey}
            setOpenRouterKey={setOpenRouterKey}
            translationLang={translationLang}
            setTranslationLang={setTranslationLang}
            aiLang={aiLang}
            setAiLang={setAiLang}
            aiVoice={aiVoice}
            setAiVoice={setAiVoice}
            playConfirm={playConfirm}
          />
        )}
      </div>
    </div>
  );
}
