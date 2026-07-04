import React from 'react';
import { Plus, Grid3x3 } from 'lucide-react';

export default function GameCard({ game, isSelected, onClick }) {
  const isAddCard = game.isAddCard;
  const isGridCard = game.isGridCard;

  // Grid View card (last item)
  if (isGridCard) {
    return (
      <div
        onClick={() => onClick(game)}
        className={`
          relative flex-shrink-0 cursor-pointer transition-all duration-300 ease-out
          ${isSelected ? 'w-[120px] h-[120px] mx-3' : 'w-[90px] h-[90px]'}
        `}
      >
        <div
          className={`
          w-full h-full rounded-xl overflow-hidden flex items-center justify-center
          bg-white/5 hover:bg-white/10 transition-all duration-300
          ${isSelected ? 'game-card-selected' : 'game-card-unselected'}
        `}
        >
          <Grid3x3 size={isSelected ? 32 : 24} className="text-white/50" />
        </div>
      </div>
    );
  }

  // Add Game card
  if (isAddCard) {
    return (
      <div
        onClick={() => onClick(game)}
        className={`
          relative flex-shrink-0 cursor-pointer transition-all duration-300 ease-out
          ${isSelected ? 'w-[120px] h-[160px] mx-3' : 'w-[90px] h-[120px]'}
        `}
      >
        <div
          className={`
          w-full h-full rounded-xl overflow-hidden flex flex-col items-center justify-center gap-2
          bg-white/5 hover:bg-white/10 transition-all duration-300
          ${isSelected ? 'game-card-selected' : 'game-card-unselected'}
        `}
        >
          <div
            className={`rounded-full border-2 border-dashed border-white/25 flex items-center justify-center
            ${isSelected ? 'w-12 h-12' : 'w-8 h-8'}`}
          >
            <Plus size={isSelected ? 22 : 14} className="text-white/45" />
          </div>
          {isSelected && <span className="text-white/40 text-[10px] font-medium">Add Game</span>}
        </div>
      </div>
    );
  }

  // Regular Game Card - PS5 Style
  return (
    <div
      onClick={() => onClick(game)}
      className={`
        relative flex-shrink-0 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
        ${isSelected ? 'w-[130px] h-[170px] z-20 mx-2 -mt-3' : 'w-[95px] h-[125px] z-10 mx-0.5'}
      `}
    >
      <div
        className={`
        w-full h-full rounded-xl overflow-hidden transition-all duration-300
        ${isSelected ? 'game-card-selected' : 'game-card-unselected'}
      `}
      >
        {game.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={game.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-ps-gray to-ps-dark flex items-center justify-center p-2">
            <span className="text-white/35 text-[10px] text-center font-medium leading-tight">
              {game.title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
