import { useState, useEffect } from 'react';
import { Search, Settings, Power, LayoutDashboard, Gamepad2, Cpu, Filter } from 'lucide-react';
import { api } from '../services/api';

export default function TopBar({ gamepadConnected, onAddGame, activeTab = 'games', onTabChange, focusedActionIndex, activeTheme, onThemeChange, onSyncStores, collections = [], activeCollection, onCollectionChange }) {
  const [time, setTime] = useState(new Date());
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [stats, setStats] = useState(null);

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
      {/* Left side: PS5-style tabs */}
      <nav className="flex items-center gap-8" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={() => onTabChange?.('games')}
          className={`ps5-tab ${activeTab === 'games' ? 'active' : ''} ${focusedActionIndex === 0 ? 'ring-2 ring-white ring-offset-4 ring-offset-[#121212] rounded-md scale-105' : ''}`}
        >
          Games
        </button>
        <button
          onClick={() => onTabChange?.('media')}
          className={`ps5-tab ${activeTab === 'media' ? 'active' : ''} ${focusedActionIndex === 1 ? 'ring-2 ring-white ring-offset-4 ring-offset-[#121212] rounded-md scale-105' : ''}`}
        >
          Media
        </button>
        <button
          onClick={() => onTabChange?.('screenshots')}
          className={`ps5-tab ${activeTab === 'screenshots' ? 'active' : ''} ${focusedActionIndex === 2 ? 'ring-2 ring-white ring-offset-4 ring-offset-[#121212] rounded-md scale-105' : ''}`}
        >
          Screenshots
        </button>
        <button
          onClick={() => onTabChange?.('news')}
          className={`ps5-tab ${activeTab === 'news' ? 'active' : ''} ${focusedActionIndex === 3 ? 'ring-2 ring-white ring-offset-4 ring-offset-[#121212] rounded-md scale-105' : ''}`}
        >
          News
        </button>
      </nav>

      {/* Right side: Icons + Avatar + Clock */}
      <div className="flex items-center gap-5" style={{ WebkitAppRegion: 'no-drag' }}>
        
        {/* System Monitor */}
        {stats && (
          <div className="flex flex-col items-end mr-2 opacity-70">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <Cpu size={12} />
              <span>CPU {Math.round(stats.cpuLoad)}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>RAM {Math.round(stats.memUsed / 1024 / 1024 / 1024)}GB</span>
            </div>
          </div>
        )}

        {/* Gamepad Status */}
        {gamepadConnected && (
          <div className="mr-2 flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400" title="Gamepad Connected">
            <Gamepad2 size={16} />
          </div>
        )}

        {/* Filter Collections */}
        {collections.length > 0 && activeTab === 'games' && (
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-all duration-200 ${activeCollection ? 'bg-cyan-500/20 text-cyan-400' : ''}`}
            >
              <Filter size={17} className={activeCollection ? "text-cyan-400" : "text-white/60"} />
            </button>
            
            {showFilterMenu && (
              <div className="absolute top-12 right-0 bg-[#1e1e1e] border border-white/10 rounded-md p-2 shadow-2xl min-w-[150px] z-[100]" style={{ animation: 'slide-up 0.2s ease-out' }}>
                <div className="text-xs font-bold text-white/50 mb-2 px-2 uppercase tracking-wider">Filter By</div>
                <button 
                  onClick={() => { onCollectionChange(null); setShowFilterMenu(false); }} 
                  className={`w-full text-left px-3 py-2 rounded-sm text-sm font-semibold transition-colors ${!activeCollection ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}`}
                >
                  All Games
                </button>
                {collections.map(col => (
                  <button 
                    key={col}
                    onClick={() => { onCollectionChange(col); setShowFilterMenu(false); }} 
                    className={`w-full text-left px-3 py-2 rounded-sm text-sm font-semibold transition-colors ${activeCollection === col ? 'bg-cyan-500/30 text-white border border-cyan-400' : 'text-white/70 hover:bg-white/5'}`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <button className={`w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-all duration-200 ${focusedActionIndex === 4 ? 'ring-2 ring-white scale-110 bg-white/20' : ''}`}>
          <Search size={17} className={focusedActionIndex === 4 ? "text-white" : "text-white/60"} />
        </button>

        {/* Settings / Theme Switcher */}
        <div className="relative">
          <button 
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className={`w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-all duration-200 ${focusedActionIndex === 3 ? 'ring-2 ring-white scale-110 bg-white/20' : ''}`}
          >
            <LayoutDashboard size={17} className={focusedActionIndex === 3 ? "text-white" : "text-white/60"} />
          </button>
          
          {showThemeMenu && (
            <div className="absolute top-12 right-0 bg-[#1e1e1e] border border-white/10 rounded-md p-2 shadow-2xl min-w-[150px] z-[100]" style={{ animation: 'slide-up 0.2s ease-out' }}>
              <div className="text-xs font-bold text-white/50 mb-2 px-2 uppercase tracking-wider">Select Interface</div>
              <button 
                onClick={() => { onThemeChange('ps5'); setShowThemeMenu(false); }} 
                className={`w-full text-left px-3 py-2 rounded-sm text-sm font-semibold transition-colors ${activeTheme === 'ps5' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}`}
              >
                PS5 Style
              </button>
              <button 
                onClick={() => { onThemeChange('xbox'); setShowThemeMenu(false); }} 
                className={`w-full text-left px-3 py-2 rounded-sm text-sm font-semibold transition-colors ${activeTheme === 'xbox' ? 'bg-[#107C10]/30 text-white border border-[#107C10]' : 'text-white/70 hover:bg-white/5'}`}
              >
                Xbox Style
              </button>
              <button 
                onClick={() => { onThemeChange('nexus'); setShowThemeMenu(false); }} 
                className={`w-full text-left px-3 py-2 rounded-sm text-sm font-semibold transition-colors ${activeTheme === 'nexus' ? 'bg-cyan-500/30 text-white border border-cyan-400' : 'text-white/70 hover:bg-white/5'}`}
              >
                Nexus (AI Core)
              </button>
              <button 
                onClick={() => { onThemeChange('coverflow'); setShowThemeMenu(false); }} 
                className={`w-full text-left px-3 py-2 rounded-sm text-sm font-semibold transition-colors ${activeTheme === 'coverflow' ? 'bg-purple-500/30 text-white border border-purple-500' : 'text-white/70 hover:bg-white/5'}`}
              >
                Cover Flow 3D
              </button>
            </div>
          )}
        </div>

        {/* User Avatar & Stores Sync Menu */}
        <div className="relative">
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)} 
            className={`w-9 h-9 rounded-full overflow-hidden border-2 cursor-pointer transition-all duration-200 ${focusedActionIndex === 4 ? 'border-white ring-4 ring-white/30 scale-110' : 'border-white/20 hover:border-white/40'}`}
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">M</span>
            </div>
          </div>
          
          {showUserMenu && (
            <div className="absolute top-12 right-0 bg-[#1e1e1e] border border-white/10 rounded-md p-2 shadow-2xl min-w-[200px] z-[100]" style={{ animation: 'slide-up 0.2s ease-out' }}>
              <div className="text-xs font-bold text-white/50 mb-2 px-2 uppercase tracking-wider">Account Settings</div>
              <button 
                onClick={() => { onSyncStores(); setShowUserMenu(false); }} 
                className="w-full text-left px-3 py-2 rounded-sm text-sm font-semibold transition-colors text-white/70 hover:bg-blue-500/30 hover:text-white flex items-center gap-2"
              >
                <span>🔄 Sync Store Accounts</span>
              </button>
            </div>
          )}
        </div>

        {/* Clock */}
        <span className="text-base font-semibold tracking-wide text-white/80 min-w-[55px] text-right">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        {/* Quit (small, subtle) */}
        <button 
          onClick={() => api.quit()}
          className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center transition-all duration-200 ml-1 ${focusedActionIndex === 5 ? 'bg-red-500 ring-2 ring-red-400 scale-110' : 'hover:bg-red-500/40'}`}
          title="Quit"
        >
          <Power size={12} className={focusedActionIndex === 5 ? "text-white" : "text-white/40"} />
        </button>
      </div>
    </header>
  );
}
