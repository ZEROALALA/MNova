import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Trash2, Check } from 'lucide-react';
import { storage } from '../services/storage';

export default function ManualAchievementsEditor({ game }) {
  const [achievements, setAchievements] = useState([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const storageKey = `manual_achievements_${game?.id}`;

  // Load from IndexedDB
  useEffect(() => {
    if (!game?.id) return;
    const load = async () => {
      try {
        const { get } = await import('idb-keyval');
        const saved = await get(storageKey);
        if (saved) setAchievements(saved);
        else setAchievements([]);
      } catch {
        setAchievements([]);
      }
    };
    load();
  }, [game?.id, storageKey]);

  // Save to IndexedDB
  const persist = async (updated) => {
    const { set } = await import('idb-keyval');
    await set(storageKey, updated);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const item = {
      id: `manual-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim(),
      achieved: false,
    };
    const updated = [...achievements, item];
    setAchievements(updated);
    persist(updated);
    setNewName('');
    setNewDesc('');
  };

  const toggleAchieved = (id) => {
    const updated = achievements.map((a) => (a.id === id ? { ...a, achieved: !a.achieved } : a));
    setAchievements(updated);
    persist(updated);
  };

  const handleDelete = (id) => {
    const updated = achievements.filter((a) => a.id !== id);
    setAchievements(updated);
    persist(updated);
  };

  if (!game || game.isSteam) return null;

  const achieved = achievements.filter((a) => a.achieved).length;
  const total = achievements.length;
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0;

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Trophy size={20} className="text-purple-400" />
          Custom Achievements
        </h3>
        {total > 0 && (
          <span className="text-sm text-white/60">
            {achieved} / {total}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-white/40">{percentage}% complete</p>
        </>
      )}

      {/* Add new */}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Achievement name"
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="px-3 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/40 transition-colors disabled:opacity-30"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              ach.achieved ? 'bg-white/5' : 'bg-white/[0.02]'
            }`}
          >
            <button
              onClick={() => toggleAchieved(ach.id)}
              className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                ach.achieved
                  ? 'bg-purple-500 border-purple-400'
                  : 'bg-white/5 border-white/20 hover:border-white/40'
              }`}
            >
              {ach.achieved && <Check size={14} className="text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${ach.achieved ? 'text-white' : 'text-white/60'}`}
              >
                {ach.name}
              </p>
              {ach.description && (
                <p className="text-xs text-white/30 truncate">{ach.description}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(ach.id)}
              className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {total === 0 && (
        <p className="text-xs text-white/30 text-center py-4">
          No achievements yet. Add your first one above!
        </p>
      )}
    </div>
  );
}
