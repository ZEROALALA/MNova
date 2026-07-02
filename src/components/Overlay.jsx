import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Cpu, Clock, Activity, Search, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

export default function Overlay() {
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState(null);
  
  // Browser State
  const [urlInput, setUrlInput] = useState('https://duckduckgo.com');
  const [currentUrl, setCurrentUrl] = useState('https://duckduckgo.com');
  const webviewRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(async () => {
      setTime(new Date());
      if (api.isElectron) {
        const data = await api.getSystemStats();
        if (data) setStats(data);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGo = (e) => {
    e.preventDefault();
    let finalUrl = urlInput.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        finalUrl = `https://duckduckgo.com/?q=${encodeURIComponent(finalUrl)}`;
      }
    }
    setCurrentUrl(finalUrl);
  };

  const goBack = () => webviewRef.current?.goBack();
  const goForward = () => webviewRef.current?.goForward();
  const reload = () => webviewRef.current?.reload();

  useEffect(() => {
    const view = webviewRef.current;
    if (view) {
      const updateUrl = (e) => setUrlInput(e.url);
      view.addEventListener('did-navigate', updateUrl);
      view.addEventListener('did-navigate-in-page', updateUrl);
      return () => {
        view.removeEventListener('did-navigate', updateUrl);
        view.removeEventListener('did-navigate-in-page', updateUrl);
      };
    }
  }, [currentUrl]); // re-bind when url loads

  return (
    <div className="w-screen h-screen bg-black/60 backdrop-blur-lg flex flex-col p-10 text-white font-mono select-none overflow-hidden animate-[fade-in_0.2s_ease-out]" style={{ WebkitAppRegion: 'drag' }}>
      <div className="flex justify-between items-start w-full shrink-0 mb-6">
        <div className="flex flex-col drop-shadow-2xl">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </h1>
          <p className="text-xl text-cyan-400 mt-2 tracking-[0.3em] uppercase font-bold">MNova Overlay</p>
        </div>
        
        {stats && (
          <div className="bg-[#0f1115]/80 p-6 rounded-2xl border border-white/10 backdrop-blur-2xl flex gap-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col items-center">
              <Cpu size={28} className="text-cyan-400 mb-3 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
              <span className="text-3xl font-bold">{Math.round(stats.cpuLoad)}%</span>
              <span className="text-sm text-white/50 tracking-widest mt-1">CPU</span>
            </div>
            <div className="flex flex-col items-center">
              <Activity size={28} className="text-purple-400 mb-3 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              <span className="text-3xl font-bold">{Math.round(stats.memUsed / 1024 / 1024 / 1024)}GB</span>
              <span className="text-sm text-white/50 tracking-widest mt-1">RAM</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Browser */}
      <div className="flex-1 flex flex-col bg-[#0f1115]/90 rounded-2xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-3xl mb-16" style={{ WebkitAppRegion: 'no-drag' }}>
        
        {/* Browser Toolbar */}
        <div className="h-14 bg-black/60 border-b border-white/5 flex items-center px-4 gap-3 shrink-0">
          <div className="flex gap-2">
            <button onClick={goBack} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft size={18} /></button>
            <button onClick={goForward} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><ArrowRight size={18} /></button>
            <button onClick={reload} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><RefreshCw size={18} /></button>
          </div>
          
          <form onSubmit={handleGo} className="flex-1 max-w-3xl flex items-center bg-black/50 border border-white/10 rounded-xl px-4 py-2 focus-within:border-cyan-500/50 transition-colors">
            <Search size={16} className="text-white/40 mr-3" />
            <input 
              type="text" 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-white/90 placeholder-white/30"
              placeholder="Search guides, maps, or enter URL..."
            />
          </form>
        </div>

        {/* Webview */}
        <div className="flex-1 bg-white relative">
          <webview 
            ref={webviewRef}
            src={currentUrl} 
            className="absolute inset-0 w-full h-full"
            allowpopups="true"
          />
        </div>
      </div>

      <div className="absolute bottom-6 left-10 flex gap-4 text-white/70 text-sm">
        <div className="bg-black/50 px-5 py-3 rounded-xl border border-white/10 backdrop-blur-md shadow-lg flex items-center gap-3">
          <div className="px-2 py-1 bg-white/20 rounded text-white font-bold tracking-widest">CTRL+SHIFT+G</div>
          <span>to close overlay</span>
        </div>
      </div>
    </div>
  );
}
