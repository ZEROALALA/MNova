import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Pencil, Trash2, Trophy, Play } from 'lucide-react';
import VideoPlayerOverlay from '../components/VideoPlayerOverlay';
import { api } from '../services/api';
import useParallax from '../hooks/useParallax';
import useAutoTrailer from '../hooks/useAutoTrailer';

const CoverflowLayout = forwardRef(({
  games,
  selectedId,
  setSelectedId,
  onPlay,
  onDelete,
  onEdit,
  onViewAchievements,
  onAddGame,
  playNav,
  playLaunch,
  focusedRegion,
  setFocusedRegion
}, ref) => {
  const containerRef = useRef(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [focusedActionIndex, setFocusedActionIndex] = useState(0);
  const [isWokenUp, setIsWokenUp] = useState(false);
  const parallax = useParallax(15);

  const selectedIndex = games.findIndex(g => g.id === selectedId);
  const selectedGame = games.find(g => g.id === selectedId);
  const isSpecialCard = selectedGame?.isAddCard || selectedGame?.isGridCard;
  
  const autoTrailer = useAutoTrailer(selectedGame);
  const videoUrlsToPlay = selectedGame?.videoUrls?.length > 0 
    ? selectedGame.videoUrls 
    : (selectedGame?.videoUrl ? [selectedGame.videoUrl] : (autoTrailer ? [autoTrailer] : []));
  const maxActions = selectedGame?.isSteam ? 3 : 2;

  useEffect(() => {
    if (selectedGame?.backgroundUrl || selectedGame?.coverUrl) {
      setImageLoaded(false);
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.src = selectedGame.backgroundUrl || selectedGame.coverUrl;
    }
  }, [selectedGame?.backgroundUrl, selectedGame?.coverUrl]);

  useEffect(() => {
    if (isVideoPlaying) {
      setIsWokenUp(false);
    }
  }, [isVideoPlaying]);

  useEffect(() => {
    const handleWake = () => setIsWokenUp(true);
    window.addEventListener('mousedown', handleWake);
    window.addEventListener('keydown', handleWake);
    return () => {
      window.removeEventListener('mousedown', handleWake);
      window.removeEventListener('keydown', handleWake);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    handleGamepadAction: (action) => {
      setIsWokenUp(true);
      const currentIndex = games.findIndex(g => g.id === selectedId);
      const game = games[currentIndex];

      if (focusedRegion === 'CAROUSEL') {
        if (action === 'LEFT' && currentIndex > 0) {
          playNav();
          setSelectedId(games[currentIndex - 1].id);
          return true;
        }
        if (action === 'RIGHT' && currentIndex < games.length - 1) {
          playNav();
          setSelectedId(games[currentIndex + 1].id);
          return true;
        }
        if (action === 'UP') {
          playNav();
          setFocusedRegion('TOP_BAR');
          return true;
        }
        if (action === 'DOWN' && !isSpecialCard) {
          playNav();
          setFocusedRegion('ACTIONS');
          setFocusedActionIndex(0);
          return true;
        }
        if (action === 'CONFIRM') {
          if (!game) return true;
          if (game.isAddCard) {
            playLaunch();
            onAddGame();
          } else if (!game.isGridCard) {
            playLaunch();
            onPlay(game);
          }
          return true;
        }
      } else if (focusedRegion === 'ACTIONS') {
        if (action === 'UP') {
          playNav();
          setFocusedRegion('CAROUSEL');
          return true;
        } else if (action === 'LEFT' && focusedActionIndex > 0) {
          playNav();
          setFocusedActionIndex(focusedActionIndex - 1);
          return true;
        } else if (action === 'RIGHT' && focusedActionIndex < maxActions) {
          playNav();
          setFocusedActionIndex(focusedActionIndex + 1);
          return true;
        } else if (action === 'CONFIRM') {
          if (focusedActionIndex === 0) {
            playLaunch();
            onPlay(game);
          } else if (focusedActionIndex === 1) {
            onEdit(game);
          } else if (focusedActionIndex === 2) {
            onDelete(game);
          } else if (focusedActionIndex === 3) {
            api.getAchievements(game.steamId).then(onViewAchievements).catch(console.error);
          }
          setFocusedRegion('CAROUSEL');
          return true;
        }
      }
      return false;
    }
  }));

  const uiOpacityClass = isVideoPlaying && !isWokenUp ? 'opacity-0 pointer-events-none' : 'opacity-100';

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-hidden flex flex-col font-sans select-none">
      
      {/* Background (Clear, un-blurred image) */}
      {!isSpecialCard && (
        <div 
          className="absolute bg-cover bg-center transition-opacity duration-1000"
          style={{ 
            top: '-30px', left: '-30px', right: '-30px', bottom: '-30px',
            transform: `translate(${parallax.x * -1}px, ${parallax.y * -1}px)`,
            backgroundImage: `url(${selectedGame?.backgroundUrl || selectedGame?.coverUrl})`,
            opacity: isVideoPlaying && !isWokenUp ? 0 : (imageLoaded ? 0.6 : 0)
          }}
        />
      )}

      <div className="absolute inset-0 bg-[#02050a] z-0 pointer-events-none">
        {selectedGame?.backgroundUrl && !isVideoPlaying && (
          <img 
            src={selectedGame.backgroundUrl} 
            alt="background" 
            className="w-full h-full object-cover opacity-30" 
          />
        )}
        <VideoPlayerOverlay 
          videoUrls={videoUrlsToPlay}
          isVisible={!isSpecialCard}
          onPlayingChange={setIsVideoPlaying}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050a] via-[#02050a]/80 to-transparent" />
      </div>

      {/* Gradient Overlays for readability */}
      <div className={`absolute inset-0 bg-gradient-to-t from-[#0f0c29] via-[#302b63]/60 to-transparent pointer-events-none transition-opacity duration-1000 ${uiOpacityClass}`} />
      <div className={`absolute inset-0 bg-gradient-to-r from-[#0f0c29] via-transparent to-[#24243e]/50 pointer-events-none transition-opacity duration-1000 ${uiOpacityClass}`} />

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col pt-[100px] pb-10">
        
        {/* Selected Game Title Area */}
        <div className={`h-40 flex flex-col items-center justify-end mb-4 z-10 transition-opacity duration-1000 ${uiOpacityClass}`}>
            <div key={selectedId} className="text-center animate-fade-in-up">
              <h1 className="text-6xl font-black tracking-widest text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                {selectedGame ? selectedGame.title : ''}
              </h1>
              {selectedGame && !isSpecialCard && selectedGame.developer && (
                <p className="text-cyan-300 font-bold mt-2 text-md tracking-[0.3em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {selectedGame.developer}
                </p>
              )}
            </div>

            {/* ACTION BUTTONS (Play, Edit, Remove, Achievements) */}
            {!isSpecialCard && (
              <div className="mt-6 flex flex-wrap justify-center items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/10 pointer-events-auto">
                <button 
                  onClick={() => { playLaunch(); onPlay(selectedGame); }}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${focusedRegion === 'ACTIONS' && focusedActionIndex === 0 ? 'bg-cyan-500 text-white ring-2 ring-white scale-105 shadow-[0_0_15px_rgba(0,229,255,0.5)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <Play size={18} /> PLAY
                </button>
                <button 
                  onClick={() => onEdit(selectedGame)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${focusedRegion === 'ACTIONS' && focusedActionIndex === 1 ? 'bg-purple-500 text-white ring-2 ring-white scale-105 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <Pencil size={18} /> EDIT
                </button>
                <button 
                  onClick={() => onDelete(selectedGame)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${focusedRegion === 'ACTIONS' && focusedActionIndex === 2 ? 'bg-red-600 text-white ring-2 ring-white scale-105 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <Trash2 size={18} /> REMOVE
                </button>
                {selectedGame?.isSteam && (
                  <button 
                    onClick={() => {
                      api.getAchievements(selectedGame.steamId).then(onViewAchievements).catch(console.error);
                    }}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${focusedRegion === 'ACTIONS' && focusedActionIndex === 3 ? 'bg-blue-500 text-white ring-2 ring-white scale-105 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    <Trophy size={18} /> ACHIEVEMENTS
                  </button>
                )}
              </div>
            )}
        </div>

        {/* 3D Cover Flow Area */}
        <div 
          className={`flex-1 flex items-center justify-center overflow-visible px-10 relative transition-opacity duration-1000 ${uiOpacityClass}`}
          style={{ perspective: '1200px' }}
        >
          <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
            {games.map((game, index) => {
              const offset = index - selectedIndex;
              const isSelected = offset === 0;
              const isFocusedCard = isSelected && focusedRegion === 'CAROUSEL';
              
              // Math for 3D positioning
              // If selected: dead center, full size, no rotation
              // If offset > 0 (right): rotateY(-45deg), translate X positive, translate Z back
              // If offset < 0 (left): rotateY(45deg), translate X negative, translate Z back
              
              const rotateY = isSelected ? 0 : offset > 0 ? -50 : 50;
              const translateX = isSelected ? 0 : offset * 180;
              const translateZ = isSelected ? 150 : -Math.abs(offset) * 100 - 100;
              const scale = isSelected ? 1 : 1 - Math.abs(offset) * 0.05;
              const opacity = isSelected ? 1 : Math.max(0, 1 - Math.abs(offset) * 0.2);
              const zIndex = 100 - Math.abs(offset);

              if (opacity === 0) return null; // Don't render cards that are too far away

              return (
                <div
                  key={game.id}
                  id={`coverflow-card-${game.id}`}
                  style={{
                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity: opacity,
                    zIndex: zIndex,
                    transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  }}
                  className="absolute cursor-pointer"
                  onClick={() => {
                    if (!isSelected) {
                      playNav();
                      setSelectedId(game.id);
                      setFocusedRegion('CAROUSEL');
                    } else if (isFocusedCard) {
                      if (game.isAddCard) { onAddGame(); }
                      else if (!game.isGridCard) { playLaunch(); onPlay(game); }
                    }
                  }}
                >
                  {/* Card Container */}
                  <div 
                    className={`w-[260px] h-[360px] rounded-xl overflow-hidden shadow-2xl transition-all duration-300 relative border-2
                      ${isFocusedCard ? 'border-cyan-400 shadow-[0_0_40px_rgba(0,229,255,0.6)]' : 'border-white/10 bg-[#1a1a2e]'}`}
                  >
                    {/* Reflection / Glow overlay */}
                    {isFocusedCard && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-cyan-400/30 mix-blend-overlay z-10 pointer-events-none" />
                    )}

                    {game.isAddCard || game.isGridCard ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#2a2a4e] to-[#1a1a2e] text-white/50 hover:text-white/90 transition-colors">
                        <span className="text-7xl mb-6">{game.isAddCard ? '+' : '⊞'}</span>
                        <span className="font-bold tracking-wider">{game.title}</span>
                      </div>
                    ) : (
                      <>
                        {game.coverUrl ? (
                          <img src={game.coverUrl} className="w-full h-full object-cover" alt={game.title} />
                        ) : (
                          <div className="w-full h-full bg-[#111] flex items-center justify-center p-4 text-center">
                            <span className="font-bold text-xl">{game.title}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Glossy shine reflection on the card itself */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none" />
                  </div>
                  
                  {/* Floor Reflection */}
                  {isSelected && (
                    <div 
                      className="absolute bottom-[-360px] left-0 w-full h-[360px] scale-y-[-1] opacity-30 pointer-events-none"
                      style={{
                        maskImage: 'linear-gradient(to bottom, transparent 40%, black 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 40%, black 100%)'
                      }}
                    >
                       <div className="w-[260px] h-[360px] rounded-xl overflow-hidden opacity-50 blur-[2px]">
                          {game.isAddCard || game.isGridCard ? (
                             <div className="w-full h-full bg-[#2a2a4e]" />
                          ) : (
                             game.coverUrl ? <img src={game.coverUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-[#111]" />
                          )}
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Controls Guide */}
      <div className={`absolute bottom-6 w-full flex justify-center gap-12 text-sm font-medium tracking-wider text-white/60 transition-opacity duration-1000 ${uiOpacityClass}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold text-xs shadow-[0_0_10px_rgba(0,229,255,0.3)]">A</div>
          <span>LAUNCH</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-xs">X</div>
          <span>EDIT</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-xs">Y</div>
          <span>TROPHIES</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-xs">M</div>
          <span>MENU</span>
        </div>
      </div>
      
    </div>
  );
});

export default CoverflowLayout;
