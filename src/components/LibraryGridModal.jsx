import React, { useEffect, useRef, useState } from 'react';
import { X, Search, Heart, LayoutGrid } from 'lucide-react';
import useGamepad from '../hooks/useGamepad';
import { useLanguage } from '../LanguageContext';

export default function LibraryGridModal({ isOpen, onClose, games, onSelectGame }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const gridRef = useRef(null);

  const filterableGames = games.filter((g) => !g.isAddCard && !g.isGridCard);
  const filtered = filterableGames.filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  useGamepad((action) => {
    if (!isOpen) return;

    if (action === 'BACK') {
      onClose();
    } else if (action === 'RIGHT' && selectedIndex < filtered.length - 1) {
      setSelectedIndex((s) => s + 1);
    } else if (action === 'LEFT' && selectedIndex > 0) {
      setSelectedIndex((s) => s - 1);
    } else if (action === 'DOWN') {
      // rough grid math, assuming ~4 cols depending on screen
      setSelectedIndex((s) => Math.min(s + 4, filtered.length - 1));
    } else if (action === 'UP') {
      setSelectedIndex((s) => Math.max(s - 4, 0));
    } else if (action === 'CONFIRM') {
      if (filtered[selectedIndex]) {
        onSelectGame(filtered[selectedIndex].id);
        onClose();
      }
    }
  });

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll selected item into view safely using scrollTo instead of scrollIntoView
    // This prevents the browser from accidentally scrolling the main #root/body window
    if (gridRef.current) {
      const selectedEl = gridRef.current.children[selectedIndex];
      const container = gridRef.current.parentElement; // The div with overflow-y-auto
      if (selectedEl && container) {
        const selectedRect = selectedEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Only scroll if it's outside the comfortable view area or if we want it centered
        // Let's calculate the top offset relative to the container's current scroll position
        const scrollTop = container.scrollTop + (selectedRect.top - containerRect.top) - (containerRect.height / 2) + (selectedRect.height / 2);
        
        container.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#0a0a0a]/95 backdrop-blur-3xl animate-[fade-in_0.2s_ease-out] flex flex-col font-sans">
      {/* Header */}
      <div className="shrink-0 h-24 border-b border-white/10 flex items-center justify-between px-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-4 text-white">
          <div className="p-3 bg-white/10 rounded-2xl">
            <LayoutGrid size={28} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('lib_full')}</h1>
            <p className="text-sm text-white/50 font-medium">
              {filterableGames.length} Games Available
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all text-sm font-medium"
            />
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40">
            <Search size={48} className="mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-white/60 mb-2">No games found</h2>
            <p>Try adjusting your search terms</p>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 auto-rows-max"
          >
            {filtered.map((game, idx) => (
              <div
                key={game.id}
                onClick={() => {
                  onSelectGame(game.id);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group
                  ${
                    selectedIndex === idx
                      ? 'ring-4 ring-cyan-400 scale-105 shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-10'
                      : 'hover:ring-2 hover:ring-white/30 hover:scale-105 opacity-80 hover:opacity-100'
                  }
                `}
              >
                <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">
                    {game.title}
                  </h3>
                  {game.developer && (
                    <span className="text-xs text-white/60 font-semibold tracking-widest uppercase mt-1">
                      {game.developer}
                    </span>
                  )}
                </div>

                {game.isFavorite && (
                  <div className="absolute top-3 right-3 bg-black/60 p-1.5 rounded-full backdrop-blur-md text-red-500">
                    <Heart size={16} fill="currentColor" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
