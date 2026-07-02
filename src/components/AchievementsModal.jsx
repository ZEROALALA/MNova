import React from 'react';
import { X, Lock, Trophy } from 'lucide-react';

export default function AchievementsModal({ isOpen, onClose, game, data }) {
  if (!isOpen || !game) return null;

  const achievements = data?.achievements || [];
  const total = data?.total || 0;
  const achieved = data?.achieved || 0;
  const progress = data?.percentage || 0;
  
  const isPrivate = data?.error === 'private';

  // PS5 style trophy breakdown
  const gold = Math.floor(achieved * 0.15);
  const silver = Math.floor(achieved * 0.25);
  const bronze = achieved - gold - silver;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="w-full h-full max-w-5xl max-h-[85vh] flex flex-col bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-[fade-in_0.3s_ease-out]">
        
        {/* Header */}
        <div className="relative h-48 shrink-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${game.backgroundUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-8 flex items-end justify-between">
            <div className="flex items-center gap-6">
              {game.logoUrl ? (
                <img src={game.logoUrl} alt={game.title} className="h-16 object-contain" />
              ) : (
                <h1 className="text-4xl font-bold text-white">{game.title}</h1>
              )}
              <div className="h-12 w-[1px] bg-white/20 mx-2" />
              <div>
                <div className="text-white/50 text-sm font-medium tracking-widest uppercase mb-1">Trophies</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{progress}%</span>
                  <span className="text-white/50 font-medium">Earned</span>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="shrink-0 border-b border-white/5 bg-white/5 px-8 py-4 flex items-center gap-12">
          <div className="flex items-center gap-3">
            <Trophy size={20} className="text-white/40" />
            <span className="text-white/60 font-medium">{achieved} / {total} Total</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" className="text-[#D4AF37]">
                <path fill="currentColor" d="M5 3h14l-1.5 5H20a2 2 0 0 1 2 2v1a5 5 0 0 1-4.39 4.96A5.97 5.97 0 0 1 13 18.88V21h3v2H8v-2h3v-2.12a5.97 5.97 0 0 1-4.61-2.92A5 5 0 0 1 2 11v-1a2 2 0 0 1 2-2h1.5L4 3h1zm1.5 5H4v3a3 3 0 0 0 2.08 2.85L6.5 8zm11 0l-.42 5.85A3 3 0 0 0 20 11V8h-2.5zM7.5 5l1 3h7l1-3h-9z"/>
              </svg>
              <span className="text-white font-bold">{gold}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" className="text-[#C0C0C0]">
                <path fill="currentColor" d="M5 3h14l-1.5 5H20a2 2 0 0 1 2 2v1a5 5 0 0 1-4.39 4.96A5.97 5.97 0 0 1 13 18.88V21h3v2H8v-2h3v-2.12a5.97 5.97 0 0 1-4.61-2.92A5 5 0 0 1 2 11v-1a2 2 0 0 1 2-2h1.5L4 3h1zm1.5 5H4v3a3 3 0 0 0 2.08 2.85L6.5 8zm11 0l-.42 5.85A3 3 0 0 0 20 11V8h-2.5zM7.5 5l1 3h7l1-3h-9z"/>
              </svg>
              <span className="text-white font-bold">{silver}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" className="text-[#CD7F32]">
                <path fill="currentColor" d="M5 3h14l-1.5 5H20a2 2 0 0 1 2 2v1a5 5 0 0 1-4.39 4.96A5.97 5.97 0 0 1 13 18.88V21h3v2H8v-2h3v-2.12a5.97 5.97 0 0 1-4.61-2.92A5 5 0 0 1 2 11v-1a2 2 0 0 1 2-2h1.5L4 3h1zm1.5 5H4v3a3 3 0 0 0 2.08 2.85L6.5 8zm11 0l-.42 5.85A3 3 0 0 0 20 11V8h-2.5zM7.5 5l1 3h7l1-3h-9z"/>
              </svg>
              <span className="text-white font-bold">{bronze}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {isPrivate ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Lock size={32} className="text-white/40" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Profile is Private</h3>
              <p className="text-white/60 max-w-md mx-auto leading-relaxed">
                We cannot retrieve your achievements because your Steam profile privacy settings are set to "Private". Please go to your Steam profile settings and set "Game details" to "Public".
              </p>
            </div>
          ) : total === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Trophy size={32} className="text-white/40" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No Achievements Found</h3>
              <p className="text-white/60 max-w-md mx-auto leading-relaxed">
                This game does not have any Steam achievements, or you haven't played it on this account yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-5 p-4 rounded-2xl border transition-all ${
                    ach.achieved 
                      ? 'bg-white/10 border-white/20 hover:bg-white/15' 
                      : 'bg-white/5 border-transparent opacity-60'
                  }`}
                >
                  <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-black/50">
                    {ach.icon && (
                      <img 
                        src={ach.icon} 
                        alt={ach.title} 
                        className={`w-full h-full object-cover ${!ach.achieved ? 'grayscale opacity-50' : ''}`}
                      />
                    )}
                    {!ach.achieved && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Lock size={20} className="text-white/50" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-lg font-bold truncate mb-1 ${ach.achieved ? 'text-white' : 'text-white/70'}`}>
                      {ach.title}
                    </h4>
                    <p className={`text-sm line-clamp-2 leading-relaxed ${ach.achieved ? 'text-white/70' : 'text-white/40'}`}>
                      {ach.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
