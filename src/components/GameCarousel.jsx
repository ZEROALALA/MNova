import React, { useRef, useEffect } from 'react';
import GameCard from './GameCard';
import { ShoppingBag } from 'lucide-react';

export default function GameCarousel({ games, selectedId, onSelect }) {
  const scrollRef = useRef(null);

  // Auto-scroll to selected game
  useEffect(() => {
    if (!scrollRef.current || !selectedId) return;
    const container = scrollRef.current;
    const selectedIdx = games.findIndex(g => g.id === selectedId);
    if (selectedIdx < 0) return;

    const cards = container.children;
    if (!cards[selectedIdx + 1]) return; // +1 for PS Store icon

    const card = cards[selectedIdx + 1]; // offset by PS Store icon
    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    
    const scrollLeft = card.offsetLeft - containerRect.width / 2 + cardRect.width / 2;
    container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
  }, [selectedId, games]);

  const selectedGame = games.find(g => g.id === selectedId);

  return (
    <div className="absolute top-16 left-0 right-0 z-30">
      {/* Carousel row */}
      <div
        ref={scrollRef}
        className="flex items-end gap-1 px-6 py-3 no-scrollbar overflow-x-auto"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* PS Store / App Store icon (first item) */}
        <div className="flex-shrink-0 w-[55px] h-[55px] rounded-xl bg-white/5 flex items-center justify-center mr-2 cursor-pointer hover:bg-white/10 transition-all game-card-unselected">
          <ShoppingBag size={22} className="text-blue-400/70" />
        </div>

        {/* Game cards */}
        {games.map(game => (
          <GameCard
            key={game.id}
            game={game}
            isSelected={game.id === selectedId}
            onClick={onSelect}
          />
        ))}
      </div>

      {/* Selected game name + source badge */}
      {selectedGame && !selectedGame.isAddCard && !selectedGame.isGridCard && (
        <div className="flex items-center gap-3 px-10 mt-1" style={{ animation: 'slide-up 0.3s ease-out' }}>
          <span className="source-badge">
            {selectedGame.isSteam ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.002.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12S18.606 0 11.979 0z"/>
                </svg>
                Steam
              </>
            ) : (
              <span>Custom</span>
            )}
          </span>
          <span className="text-sm font-medium text-white/85 tracking-wide">
            {selectedGame.title}
          </span>
          {selectedGame.isSteam && (
            <div className="w-2 h-2 rounded-full bg-green-400/60 ml-1" title="Online" />
          )}
        </div>
      )}
    </div>
  );
}
