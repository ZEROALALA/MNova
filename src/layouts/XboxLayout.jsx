import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Pencil, Trash2, Trophy, Play } from 'lucide-react';
import VideoPlayerOverlay from '../components/VideoPlayerOverlay';
import { api } from '../services/api';
import useParallax from '../hooks/useParallax';
import useAutoTrailer from '../hooks/useAutoTrailer';

const XboxLayout = forwardRef(({
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [focusedActionIndex, setFocusedActionIndex] = useState(0);
  const [isWokenUp, setIsWokenUp] = useState(false);
  const parallax = useParallax(15);
  const selectedGame = games.find(g => g.id === selectedId);
  const isSpecialCard = selectedGame?.isAddCard || selectedGame?.isGridCard;
  
  const autoTrailer = useAutoTrailer(selectedGame);
  const videoUrlsToPlay = selectedGame?.videoUrls?.length > 0 
    ? selectedGame.videoUrls 
    : (selectedGame?.videoUrl ? [selectedGame.videoUrl] : (autoTrailer ? [autoTrailer] : []));
  const maxActions = selectedGame?.isSteam ? 3 : 2; // 0:Play, 1:Edit, 2:Delete, (3:Achievements)

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
        if (action === 'UP') {
          if (currentIndex >= 8) {
            playNav();
            setSelectedId(games[currentIndex - 8].id);
            return true;
          } else {
            playNav();
            setFocusedRegion('TOP_BAR');
            return true;
          }
        } else if (action === 'DOWN') {
          if (currentIndex + 8 < games.length) {
            playNav();
            setSelectedId(games[currentIndex + 8].id);
            return true;
          } else {
             playNav();
             setFocusedRegion('ACTIONS');
             setFocusedActionIndex(0);
             return true;
          }
        } else if (action === 'LEFT' && currentIndex > 0) {
          playNav();
          setSelectedId(games[currentIndex - 1].id);
          return true;
        } else if (action === 'RIGHT' && currentIndex < games.length - 1) {
          playNav();
          setSelectedId(games[currentIndex + 1].id);
          return true;
        } else if (action === 'CONFIRM') {
          if (!game) return true;
          if (game.isAddCard) {
            playLaunch();
            onAddGame();
            return true;
          }
          if (game.isGridCard) return true;
          playLaunch();
          onPlay(game);
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
        } else if (action === 'RIGHT' && focusedActionIndex <= maxActions) {
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
    <div className="absolute inset-0 z-0 bg-ps-dark">
      {/* Clear Background Image just like PS5 */}
      {!isSpecialCard && (
        <div 
          className="absolute bg-cover bg-center transition-opacity duration-700"
          style={{ 
            top: '-30px', left: '-30px', right: '-30px', bottom: '-30px',
            transform: `translate(${parallax.x * -1}px, ${parallax.y * -1}px)`,
            backgroundImage: `url(${selectedGame?.backgroundUrl || selectedGame?.coverUrl})`,
            opacity: isVideoPlaying && !isWokenUp ? 0 : (imageLoaded ? 1 : 0)
          }}
        />
      )}
      
      {/* Video Player overlay */}
      {!isSpecialCard && (selectedGame?.videoUrls?.length > 0 || selectedGame?.videoUrl) && (
        <div className="absolute inset-0 z-0 opacity-100">
          <VideoPlayerOverlay 
            videoUrls={videoUrlsToPlay}
            isVisible={!isSpecialCard}
            onPlayingChange={setIsVideoPlaying}
          />
        </div>
      )}

      {/* Standard Gradient Overlay matching PS5 layout */}
      <div className={`absolute inset-0 bg-gradient-to-t from-[#0f1015] via-[#0f1015]/60 to-transparent transition-opacity duration-1000 ${uiOpacityClass}`} />
      <div className={`absolute inset-0 bg-gradient-to-r from-[#0f1015] via-[#0f1015]/40 to-transparent transition-opacity duration-1000 ${uiOpacityClass}`} />

      {/* Main Content Area - Title at the top left */}
      <div className={`absolute top-28 left-16 z-20 transition-opacity duration-1000 ${uiOpacityClass}`}>
        {!isSpecialCard && (
          <div>
            <h1 className="text-6xl font-extrabold text-white mb-2 tracking-tight drop-shadow-2xl">
              {selectedGame?.title}
            </h1>
            {selectedGame && !isSpecialCard && selectedGame.developer && (
              <p className="text-green-500 font-bold mt-3 text-lg tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {selectedGame.developer}
              </p>
            )}
            
            {/* Playtime */}
            {selectedGame?.playtime > 0 && !isSpecialCard && (
              <p className="text-white/60 font-semibold mt-1 text-sm tracking-widest uppercase">
                PLAYTIME: {Math.floor(selectedGame.playtime / 3600)}H {Math.floor((selectedGame.playtime % 3600) / 60)}M
              </p>
            )}
          </div>
        )}
      </div>

      {/* Xbox Static Grid - Small portrait rows at the bottom (8 columns) */}
      <div className={`absolute bottom-28 left-16 right-16 z-20 transition-opacity duration-1000 ${uiOpacityClass}`}>
        <div className="grid grid-cols-8 gap-4 max-h-[45vh] overflow-y-auto pr-4">
          {games.map((game, index) => {
            const isSelected = selectedId === game.id;
            const isSpecial = game.isAddCard || game.isGridCard;
            
            return (
              <div 
                key={game.id}
                onClick={() => {
                  if (game.isAddCard) onAddGame();
                  else {
                    setSelectedId(game.id);
                    setFocusedRegion('CAROUSEL');
                  }
                }}
                className={`relative aspect-[3/4] rounded-lg overflow-hidden transition-all duration-200 cursor-pointer shadow-md
                  ${isSelected ? 'ring-[4px] ring-[#107C10] z-10 shadow-2xl shadow-[#107C10]/40' : 'hover:ring-2 hover:ring-white/40 z-0'}
                  ${isSpecial ? 'bg-white/5 border border-white/10 backdrop-blur-md' : 'bg-[#1e1e1e]'}
                `}
              >
                {!isSpecial ? (
                  <>
                    <img 
                      src={game.coverUrl} 
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Dark gradient at the bottom for the title */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-3">
                      <p className="text-white font-bold truncate drop-shadow-md text-sm">{game.title}</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 hover:text-white transition-colors">
                    <span className="text-4xl mb-1">{game.isAddCard ? '+' : '📚'}</span>
                    <span className="font-semibold text-sm">{game.title}</span>
                  </div>
                )}
                
                {/* Xbox SELECTED badge */}
                {isSelected && (
                  <div className="absolute top-0 left-0 bg-[#107C10] text-white text-[10px] font-extrabold px-2 py-1 uppercase tracking-widest shadow-md z-20 rounded-br-md">
                    SELECTED
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons ALWAYS visible for selected game */}
        {!isSpecialCard && (
          <div className="mt-6 flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-white/10 w-max pointer-events-auto">
            <button 
              onClick={() => { playLaunch(); onPlay(selectedGame); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all ${focusedRegion === 'ACTIONS' && focusedActionIndex === 0 ? 'bg-[#107C10] text-white ring-2 ring-white scale-105' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Play size={16} /> Play
            </button>
            <button 
              onClick={() => onEdit(selectedGame)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all ${focusedRegion === 'ACTIONS' && focusedActionIndex === 1 ? 'bg-gray-200 text-black ring-2 ring-white scale-105' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Pencil size={16} /> Edit
            </button>
            <button 
              onClick={() => onDelete(selectedGame)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all ${focusedRegion === 'ACTIONS' && focusedActionIndex === 2 ? 'bg-red-600 text-white ring-2 ring-white scale-105' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Trash2 size={16} /> Remove
            </button>
            {selectedGame?.isSteam && (
              <button 
                onClick={() => {
                  api.getAchievements(selectedGame.steamId).then(onViewAchievements).catch(console.error);
                }}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all ${focusedRegion === 'ACTIONS' && focusedActionIndex === 3 ? 'bg-blue-600 text-white ring-2 ring-white scale-105' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <Trophy size={16} /> Achievements
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Hint Bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-16 bg-[#080808]/80 backdrop-blur-md border-t border-white/5 flex items-center px-16 gap-8 text-sm text-gray-300 z-50 transition-opacity duration-1000 ${uiOpacityClass}`}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#107C10] text-white flex items-center justify-center font-bold text-xs shadow-md">A</div>
          <span className="font-semibold tracking-wide">Select</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#d12e2e] text-white flex items-center justify-center font-bold text-xs shadow-md">B</div>
          <span className="font-semibold tracking-wide">Back</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#2d6dc4] text-white flex items-center justify-center font-bold text-xs shadow-md">X</div>
          <span className="font-semibold tracking-wide">Edit</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#e8b525] text-black flex items-center justify-center font-bold text-xs shadow-md">Y</div>
          <span className="font-semibold tracking-wide">Achievements</span>
        </div>
      </div>
    </div>
  );
});

export default XboxLayout;
