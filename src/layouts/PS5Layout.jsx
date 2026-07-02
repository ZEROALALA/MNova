import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import VideoPlayerOverlay from '../components/VideoPlayerOverlay';
import GameCarousel from '../components/GameCarousel';
import BottomHintBar from '../components/BottomHintBar';

const PS5Layout = forwardRef(({
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

  const selectedGame = games.find(g => g.id === selectedId);
  const selectedGameIndex = games.findIndex(g => g.id === selectedId);
  const isSpecialCard = selectedGame?.isAddCard || selectedGame?.isGridCard;

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
          playNav();
          setFocusedRegion('TOP_BAR');
          return true;
        } else if (action === 'LEFT' && currentIndex > 0) {
          playNav();
          setSelectedId(games[currentIndex - 1].id);
          return true;
        } else if (action === 'RIGHT' && currentIndex < games.length - 1) {
          playNav();
          setSelectedId(games[currentIndex + 1].id);
          return true;
        } else if (action === 'DOWN' && !game?.isAddCard && !game?.isGridCard) {
          playNav();
          setFocusedRegion('ACTIONS');
          setFocusedActionIndex(0);
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
        } else if (action === 'RIGHT' && focusedActionIndex < 2) {
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
          }
          setFocusedRegion('CAROUSEL');
          return true;
        }
      }
      return false; // Not handled
    }
  }));

  const uiOpacityClass = isVideoPlaying && !isWokenUp ? 'opacity-0 pointer-events-none' : 'opacity-100';

  return (
    <>
      {/* Background Layer */}
      {!isSpecialCard && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${uiOpacityClass}`}>
          <HeroSection 
            game={selectedGame} 
            onPlay={() => { playLaunch(); onPlay(selectedGame); }} 
            onDelete={() => onDelete(selectedGame)} 
            onEdit={() => onEdit(selectedGame)} 
            onViewAchievements={(data) => onViewAchievements(data)}
            focusedActionIndex={focusedRegion === 'ACTIONS' ? focusedActionIndex : -1}
          />
        </div>
      )}
      
      {/* Video overlay */}
      {!isSpecialCard && (selectedGame?.videoUrls?.length > 0 || selectedGame?.videoUrl) && (
        <div className="absolute inset-0 z-0">
          <VideoPlayerOverlay 
            videoUrls={selectedGame.videoUrls || selectedGame.videoUrl} 
            isVisible={true} 
            onPlayingChange={setIsVideoPlaying}
          />
        </div>
      )}
      
      {/* Default ambient when no game or special card */}
      {isSpecialCard && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-ps-blue/20 via-ps-dark to-ps-dark" />
          <div className="absolute bottom-40 left-10 max-w-lg z-20">
            <h1 className="text-4xl font-bold mb-3" style={{ animation: 'slide-up 0.4s ease-out' }}>
              {selectedGame?.isAddCard ? 'Add a Game' : 'Game Library'}
            </h1>
            <p className="text-white/40 text-base">
              {selectedGame?.isAddCard 
                ? 'Press Enter or click to add a new game to your library.' 
                : 'Browse all your games in grid view.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`relative h-full flex flex-col px-14 py-10 z-10 transition-opacity duration-1000 ${uiOpacityClass}`}>
        
        {/* Top spacing to push content down slightly */}
        <div className="h-10"></div>
      
      {/* Game Selection Carousel */}
      {games.length > 0 && (
        <GameCarousel 
          games={games} 
          selectedId={selectedId} 
          onSelect={(game) => {
            if (game.isAddCard) {
              onAddGame();
              return;
            }
            playNav();
            setSelectedId(game.id);
          }} 
        />
      )}

      {/* Bottom Hint Bar */}
      <BottomHintBar />
      </main>
    </>
  );
});

export default PS5Layout;
