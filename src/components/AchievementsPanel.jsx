import React, { useState, useEffect } from 'react';
import { Trophy, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../services/api';

export default function AchievementsPanel({ game }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!game?.isSteam || !game?.steamId) {
      setData(null);
      setError(null);
      return;
    }

    const fetchAchievements = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.getAchievements(game.steamId);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [game?.steamId, game?.isSteam]);

  if (!game?.isSteam || !game?.steamId) return null;

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-32 mb-4" />
        <div className="h-2 bg-white/10 rounded w-full mb-2" />
        <div className="h-2 bg-white/10 rounded w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <p className="text-white/50 text-sm">{error}</p>
      </div>
    );
  }

  if (!data || data.total === 0) return null;

  const displayAchievements = expanded ? data.achievements : data.achievements.slice(0, 4);

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Trophy size={20} className="text-yellow-400" />
          Achievements
        </h3>
        <span className="text-sm text-white/60">
          {data.achieved} / {data.total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${data.percentage}%` }}
        />
      </div>
      <p className="text-xs text-white/40">{data.percentage}% complete</p>

      {/* Achievement list */}
      <div className="space-y-3 mt-4">
        {displayAchievements.map((ach) => (
          <div
            key={ach.id}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
              ach.achieved ? 'bg-white/5' : 'bg-white/[0.02] opacity-60'
            }`}
          >
            <img
              src={ach.achieved ? ach.icon : ach.iconGray}
              alt={ach.name}
              className="w-10 h-10 rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{ach.name}</p>
              {ach.description && (
                <p className="text-xs text-white/40 truncate">{ach.description}</p>
              )}
            </div>
            {ach.achieved ? (
              <Trophy size={16} className="text-yellow-400 flex-shrink-0" />
            ) : (
              <Lock size={16} className="text-white/30 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Show more/less toggle */}
      {data.achievements.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors mx-auto mt-2"
        >
          {expanded ? (
            <>
              Show less <ChevronUp size={14} />
            </>
          ) : (
            <>
              Show all {data.total} <ChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
