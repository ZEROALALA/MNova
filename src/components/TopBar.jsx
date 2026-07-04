import React, { useState, useEffect } from 'react';
import {
  Search,
  Settings,
  Power,
  LayoutDashboard,
  Gamepad2,
  Cpu,
  Filter,
  AlertCircle,
  BarChart3,
  Users,
  Store,
  Image,
  MessageCircle,
  RefreshCw,
  Palette,
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../LanguageContext';
import HelpModal from './HelpModal';

export default function TopBar({
  gamepadConnected,
  onAddGame,
  activeTab = 'games',
  onTabChange,
  focusedActionIndex,
  activeTheme,
  onThemeChange,
  onSyncStores,
  collections = [],
  activeCollection,
  onCollectionChange,
  playNav,
  playConfirm,
  isAudioPlaying,
  onRequestLogin,
  currentUser,
  gamerProfile,
  onToggleMaryam,
  aiVoice
}) {
  const { t, language } = useLanguage();
  const [time, setTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [stats, setStats] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleScanGames = async () => {
    if (isScanning) return;
    setIsScanning(true);
    playConfirm?.();
    try {
      if (onSyncStores) {
        // Assume onSyncStores returns a promise or we just wait a bit if not
        await onSyncStores(); 
      }
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(async () => {
      setTime(new Date());
      if (api.isElectron) {
        const data = await api.getSystemStats();
        if (data) setStats(data);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="absolute top-0 left-0 right-0 h-20 px-10 flex items-center justify-between z-50"
      style={{ WebkitAppRegion: 'drag' }}
    >
      {/* Navigation Tabs */}
      <nav
        className="flex items-center space-x-1 space-x-reverse ml-8"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <button
          onClick={() => {
            playNav?.();
            onTabChange?.('games');
          }}
          className={`px-4 py-2 rounded-full font-bold transition-colors ${activeTab === 'games' ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
        >
          {t('nav_games')}
        </button>
        <button
          onClick={() => {
            playNav?.();
            onTabChange?.('store');
          }}
          className={`px-4 py-2 rounded-full font-bold transition-colors ${activeTab === 'store' ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
        >
          {t('nav_store')}
        </button>
        <button
          onClick={() => {
            playNav?.();
            onTabChange?.('media');
          }}
          className={`px-4 py-2 rounded-full font-bold transition-colors ${activeTab === 'media' ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
        >
          {t('nav_media')}
        </button>

        <button
          onClick={() => {
            playNav?.();
            onTabChange?.('news');
          }}
          className={`px-4 py-2 rounded-full font-bold transition-colors ${activeTab === 'news' ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
        >
          {t('nav_news')}
        </button>
        <button
          onClick={() => {
            playNav?.();
            if (!currentUser) {
              onRequestLogin();
            } else {
              onTabChange?.('community');
            }
          }}
          className={`px-4 py-2 rounded-full font-bold transition-colors ${activeTab === 'community' ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
        >
          {t('nav_community')}
        </button>
        <button
          onClick={() => {
            playNav?.();
            onTabChange?.('performance');
          }}
          className={`px-4 py-2 rounded-full font-bold transition-colors ${activeTab === 'performance' ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
        >
          {t('nav_hardware')}
        </button>
      </nav>

      {/* Right side: Icons + Avatar + Clock */}
      <div className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={() => {
            playConfirm?.();
            onToggleMaryam?.();
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 shadow-lg transition-all ${aiVoice === 'male' ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-400 hover:text-purple-300'}`}
          title="AI Assistant"
        >
          <MessageCircle size={18} />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
            {aiVoice === 'male' ? 'MNova' : 'Maryam'}
          </span>
        </button>
        <button
          onClick={() => {
            playConfirm?.();
            setShowHelpModal(true);
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 shadow-lg transition-all text-sky-400 hover:text-sky-300`}
          title={t('topbar_info')}
        >
          <AlertCircle size={18} />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
            {t('topbar_info')}
          </span>
        </button>

        <button
          onClick={handleScanGames}
          disabled={isScanning}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 shadow-lg text-emerald-400 hover:emerald-300 transition-all disabled:opacity-50`}
          title={t('topbar_scan_games')}
        >
          <RefreshCw size={18} className={isScanning ? 'animate-spin' : ''} />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
            {t('topbar_scan_games')}
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => {
              playNav?.();
              setShowThemeMenu(!showThemeMenu);
              setShowUserMenu(false);
            }}
            className={`w-10 h-10 rounded-full backdrop-blur-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 shadow-lg flex items-center justify-center text-amber-400 hover:text-amber-300 transition-all focus:outline-none`}
            title="Change Theme"
          >
            <Palette size={18} />
          </button>
          
          {showThemeMenu && (
            <div
              className="absolute top-12 right-0 bg-black/40 backdrop-blur-xl border border-white/10 rounded-md p-2 shadow-2xl min-w-[160px] z-[100]"
              style={{ animation: 'slide-up 0.2s ease-out' }}
            >
              <div className="text-xs font-bold text-white/50 mb-2 px-2 uppercase tracking-wider">
                Select Theme
              </div>
              {['ps5', 'xbox', 'nexus', 'coverflow'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => {
                    onThemeChange?.(theme);
                    setShowThemeMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-sm text-sm font-semibold transition-colors flex items-center gap-2 ${activeTheme === theme ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                >
                  <span className="capitalize">{theme === 'ps5' ? 'PlayStation 5' : theme === 'xbox' ? 'Xbox Series' : theme}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            playNav?.();
            onTabChange?.('settings');
          }}
          className={`w-10 h-10 rounded-full backdrop-blur-md bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 shadow-lg flex items-center justify-center text-blue-400 hover:text-blue-300 transition-all ${activeTab === 'settings' ? 'ring-2 ring-blue-500' : ''}`}
          title="Settings"
        >
          <Settings size={18} />
        </button>

        <div className="relative">
          <button
            onClick={() => {
              playNav?.();
              if (!currentUser) {
                onRequestLogin();
              } else {
                setShowUserMenu(!showUserMenu);
                setShowThemeMenu(false);
              }
            }}
            className="flex items-center gap-3 backdrop-blur-md bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1.5 rounded-full border border-rose-500/30 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {currentUser ? (
              <>
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-bold text-white">
                    {gamerProfile?.displayName || currentUser.displayName || 'Guest'}
                  </span>
                  <span className="text-[10px] text-white/50">
                    Online • @{gamerProfile?.gamerId || 'new'}
                  </span>
                </div>
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-rose-500/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center border-2 border-rose-500/50">
                    <span className="text-xs font-black text-rose-400">
                      {currentUser.displayName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-bold text-white">{t('lib_local_guest')}</span>
                  <span className="text-[10px] text-rose-300/50">{t('lib_offline')}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                  <Users size={14} className="text-rose-400" />
                </div>
              </>
            )}
          </button>

          {showUserMenu && (
            <div
              className="absolute top-16 right-0 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[100] p-2 min-w-[200px]"
              style={{ animation: 'slide-up 0.2s ease-out' }}
            >
              <div className="text-xs font-bold text-white/50 mb-2 px-2 uppercase tracking-wider">
                Account Settings
              </div>
              <button
                onClick={() => {
                  onSyncStores();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-500/30 rounded-xl transition-colors text-white/80 hover:text-white mb-1"
              >
                <span>🔄 Sync Store Accounts</span>
              </button>
              <button
                onClick={() => {
                  playNav?.();
                  onTabChange?.('settings');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white mb-1"
              >
                <Settings size={18} className="text-white/50" />
                <span className="font-semibold">{t('settings_menu')}</span>
              </button>
              
              <div className="h-px bg-white/10 my-1 mx-2"></div>
              
              <button
                onClick={() => {
                  playConfirm?.();
                  api.quitApp();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
              >
                <Power size={18} />
                <span className="font-semibold">Quit Game Station</span>
              </button>
            </div>
          )}

      {/* Help Modal Overlay */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
        </div>

        {/* Clock */}
        <span className="text-base font-semibold tracking-wide text-white/80 min-w-[55px] text-right">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </header>
  );
}
