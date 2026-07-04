import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AchievementsSummary({ game, onClick }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!game?.isSteam || !game?.steamId) {
      setData(null);
      return;
    }
    api
      .getAchievements(game.steamId)
      .then(setData)
      .catch(() => setData(null));
  }, [game?.steamId]);

  // Default display even without data
  const progress = data?.percentage || 0;
  const earned = data?.achieved || 0;
  const total = data?.total || 0;

  // Simulate trophy breakdown (PS5 style)
  const gold = Math.floor(earned * 0.15);
  const silver = Math.floor(earned * 0.25);
  const bronze = earned - gold - silver;

  if (!game || game.isAddCard || game.isGridCard) return null;

  return (
    <button
      onClick={() => onClick && onClick(data)}
      className="absolute bottom-36 right-10 z-20 glass-card rounded-xl px-6 py-4 min-w-[200px] text-left hover:scale-105 hover:bg-white/20 transition-all cursor-pointer group"
      style={{ animation: 'slide-up 0.6s ease-out' }}
      key={game.id}
    >
      {/* Progress & Earned */}
      <div className="flex items-baseline gap-8 mb-3">
        <div>
          <div className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-0.5">
            Progress
          </div>
          <div className="text-2xl font-bold text-white">{progress}%</div>
        </div>
        <div>
          <div className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-0.5">
            Earned
          </div>
          <div className="text-2xl font-bold text-white">
            {earned}/{total}
          </div>
        </div>
      </div>

      {/* Trophy icons */}
      <div className="flex items-center gap-4 border-t border-white/8 pt-2.5">
        {/* Gold */}
        <div className="flex items-center gap-1.5">
          <svg width="18" height="18" viewBox="0 0 24 24" className="trophy-gold">
            <path
              fill="currentColor"
              d="M5 3h14l-1.5 5H20a2 2 0 0 1 2 2v1a5 5 0 0 1-4.39 4.96A5.97 5.97 0 0 1 13 18.88V21h3v2H8v-2h3v-2.12a5.97 5.97 0 0 1-4.61-2.92A5 5 0 0 1 2 11v-1a2 2 0 0 1 2-2h1.5L4 3h1zm1.5 5H4v3a3 3 0 0 0 2.08 2.85L6.5 8zm11 0l-.42 5.85A3 3 0 0 0 20 11V8h-2.5zM7.5 5l1 3h7l1-3h-9z"
            />
          </svg>
          <span className="text-sm font-semibold text-white/70">{gold}</span>
        </div>
        {/* Silver */}
        <div className="flex items-center gap-1.5">
          <svg width="18" height="18" viewBox="0 0 24 24" className="trophy-silver">
            <path
              fill="currentColor"
              d="M5 3h14l-1.5 5H20a2 2 0 0 1 2 2v1a5 5 0 0 1-4.39 4.96A5.97 5.97 0 0 1 13 18.88V21h3v2H8v-2h3v-2.12a5.97 5.97 0 0 1-4.61-2.92A5 5 0 0 1 2 11v-1a2 2 0 0 1 2-2h1.5L4 3h1zm1.5 5H4v3a3 3 0 0 0 2.08 2.85L6.5 8zm11 0l-.42 5.85A3 3 0 0 0 20 11V8h-2.5zM7.5 5l1 3h7l1-3h-9z"
            />
          </svg>
          <span className="text-sm font-semibold text-white/70">{silver}</span>
        </div>
        {/* Bronze */}
        <div className="flex items-center gap-1.5">
          <svg width="18" height="18" viewBox="0 0 24 24" className="trophy-bronze">
            <path
              fill="currentColor"
              d="M5 3h14l-1.5 5H20a2 2 0 0 1 2 2v1a5 5 0 0 1-4.39 4.96A5.97 5.97 0 0 1 13 18.88V21h3v2H8v-2h3v-2.12a5.97 5.97 0 0 1-4.61-2.92A5 5 0 0 1 2 11v-1a2 2 0 0 1 2-2h1.5L4 3h1zm1.5 5H4v3a3 3 0 0 0 2.08 2.85L6.5 8zm11 0l-.42 5.85A3 3 0 0 0 20 11V8h-2.5zM7.5 5l1 3h7l1-3h-9z"
            />
          </svg>
          <span className="text-sm font-semibold text-white/70">{bronze}</span>
        </div>
      </div>
    </button>
  );
}
