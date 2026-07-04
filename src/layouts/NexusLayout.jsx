import React, { useState, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';
import { Pencil, Trash2, Trophy, Play, Activity, Heart } from 'lucide-react';
import VideoPlayerOverlay from '../components/VideoPlayerOverlay';
import { api } from '../services/api';
import useParallax from '../hooks/useParallax';
import useAutoTrailer from '../hooks/useAutoTrailer';
import Particles from '../components/Particles';

const NexusLayout = forwardRef(
  (
    {
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
      setFocusedRegion,
      onUiHiddenChange,
    },
    ref
  ) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const carouselRef = useRef(null);
    const [isWokenUp, setIsWokenUp] = useState(false);
    const parallax = useParallax(25);

    const selectedGameIndex = games.findIndex((g) => g.id === selectedId);
    const selectedGame = games[selectedGameIndex] || games[0];
    const isSpecialCard = selectedGame?.isAddCard || selectedGame?.isGridCard;

    const autoTrailer = useAutoTrailer(selectedGame);
    const videoUrlsToPlay =
      selectedGame?.videoUrls?.length > 0
        ? selectedGame.videoUrls
        : selectedGame?.videoUrl
          ? [selectedGame.videoUrl]
          : autoTrailer
            ? [autoTrailer]
            : [];

    useEffect(() => {
      let timer;
      const handleWake = () => {
        setIsWokenUp(true);
        clearTimeout(timer);
        if (isVideoPlaying) {
          timer = setTimeout(() => setIsWokenUp(false), 3000);
        }
      };

      window.addEventListener('mousedown', handleWake);
      window.addEventListener('mousemove', handleWake);
      window.addEventListener('wheel', handleWake);
      window.addEventListener('keydown', handleWake);
      
      if (isVideoPlaying) {
        timer = setTimeout(() => setIsWokenUp(false), 3000);
      }

      return () => {
        window.removeEventListener('mousedown', handleWake);
        window.removeEventListener('mousemove', handleWake);
        window.removeEventListener('wheel', handleWake);
        window.removeEventListener('keydown', handleWake);
        clearTimeout(timer);
      };
    }, [isVideoPlaying]);

    useEffect(() => {
      if (onUiHiddenChange) {
        onUiHiddenChange(isVideoPlaying && !isWokenUp);
      }
    }, [isVideoPlaying, isWokenUp, onUiHiddenChange]);

    useEffect(() => {
      if (selectedGame?.backgroundUrl || selectedGame?.coverUrl) {
        setImageLoaded(false);
        const img = new Image();
        img.onload = () => setImageLoaded(true);
        img.src = selectedGame.backgroundUrl || selectedGame.coverUrl;
      }
    }, [selectedGame?.backgroundUrl, selectedGame?.coverUrl]);

    useImperativeHandle(ref, () => ({
      handleGamepadAction: (action) => {
        setIsWokenUp(true);
        const game = games[selectedGameIndex];

        if (focusedRegion === 'CAROUSEL') {
          if (action === 'LEFT') {
            playNav();
            const prev = selectedGameIndex > 0 ? selectedGameIndex - 1 : games.length - 1;
            setSelectedId(games[prev].id);
            return true;
          } else if (action === 'RIGHT') {
            playNav();
            const next = selectedGameIndex < games.length - 1 ? selectedGameIndex + 1 : 0;
            setSelectedId(games[next].id);
            return true;
          } else if (action === 'UP') {
            playNav();
            setFocusedRegion('TOP_BAR');
            return true;
          } else if (action === 'DOWN') {
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
        }
        return false;
      },
    }));

    // 3D Math for the carousel
    const theta = 360 / Math.max(games.length, 1);
    const radius = Math.round(280 / 2 / Math.tan(Math.PI / Math.max(games.length, 1))) + 150;

    // Calculate current rotation
    const currentRotation = selectedGameIndex * -theta;

    const uiOpacityClass =
      isVideoPlaying && !isWokenUp ? 'opacity-0 pointer-events-none' : 'opacity-100';

    return (
      <div className="absolute inset-0 z-0 bg-[#02050a] text-cyan-50 font-sans overflow-hidden">
        {/* Neural Background */}
        <div className="fixed inset-0 z-0">
          {/* Main Background Image - Clean */}
          {!isSpecialCard && (
            <div
              ref={parallax}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
              style={{
                backgroundImage: `url(${selectedGame?.backgroundUrl || selectedGame?.coverUrl})`,
                opacity: isVideoPlaying && !isWokenUp ? 0 : imageLoaded ? 1 : 0,
              }}
            />
          )}
          <div
            className={`absolute inset-0 bg-[#02050a]/80 transition-opacity duration-1000 ${uiOpacityClass}`}
          />

          {/* Grid / Network lines */}
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ${isVideoPlaying && !isWokenUp ? 'opacity-0' : 'opacity-10'}`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.2) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
              animation: 'data-flow 20s linear infinite',
            }}
          />

          <div
            className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#02050a]/80 to-[#02050a] transition-opacity duration-1000 ${uiOpacityClass}`}
          />

          {/* Video Overlay with extreme blend modes */}
          <div className="absolute inset-0 mix-blend-screen opacity-50 z-0">
            <VideoPlayerOverlay
              videoUrls={videoUrlsToPlay}
              isVisible={!isSpecialCard}
              onPlayingChange={setIsVideoPlaying}
            />
          </div>

          {/* Global Particles for extreme cyber-immersion */}
          <div className={`absolute inset-0 transition-opacity duration-1000 ${uiOpacityClass}`}>
            <Particles count={60} />
          </div>
        </div>

        {/* Main 3D Perspective Canvas */}
        <main
          className={`relative h-screen w-screen flex items-center justify-center overflow-hidden z-10 nexus-perspective transition-opacity duration-1000 ${uiOpacityClass}`}
        >
          {/* 3D Carousel Container */}
          <div
            ref={carouselRef}
            className="nexus-carousel relative w-64 h-96"
            style={{ transform: `translateZ(${-radius}px) rotateY(${currentRotation}deg)` }}
          >
            {games.map((game, index) => {
              const isSelected = selectedId === game.id;
              const isSpecial = game.isAddCard || game.isGridCard;
              const itemAngle = theta * index;

              return (
                <div
                  key={game.id}
                  className={`absolute top-0 left-0 w-full h-full nexus-card ${isSelected ? 'active' : 'opacity-40 grayscale'} flex flex-col cursor-pointer`}
                  style={{
                    transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  }}
                  onClick={() => {
                    if (game.isAddCard) onAddGame();
                    else {
                      setSelectedId(game.id);
                      setFocusedRegion('CAROUSEL');
                    }
                  }}
                >
                  {/* Cyber Scanline effect for selected */}
                  {isSelected && <div className="scanline" />}

                  <div className="relative w-full h-full overflow-hidden p-1">
                    {!isSpecial ? (
                      <img
                        src={game.coverUrl}
                        alt={game.title}
                        className="w-full h-full object-cover opacity-90 mix-blend-luminosity"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-cyan-950/40 text-cyan-500 border border-cyan-500/30">
                        <span className="text-4xl mb-2">{game.isAddCard ? '+' : '≡'}</span>
                        <span className="font-mono text-xs tracking-[0.3em] uppercase">
                          {game.title}
                        </span>
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute inset-0 border border-cyan-400/50 pointer-events-none" />
                    )}

                    {/* Favorite Badge */}
                    {game.isFavorite && (
                      <div className="absolute top-2 right-2 z-20 bg-black/60 p-1.5 rounded-full backdrop-blur-md text-red-500 shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                        <Heart size={16} fill="currentColor" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Futuristic HUD Details Overlay */}
        <div
          className={`absolute bottom-12 left-12 z-30 max-w-2xl transition-opacity duration-1000 ${uiOpacityClass}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-cyan-400 animate-pulse" size={20} />
            <p className="font-mono text-xs text-cyan-400/80 tracking-[0.4em] uppercase">
              [ MEMORY CORE SCANNED ] // {selectedGame?.developer || 'SYS.UNKNOWN'}
            </p>
          </div>

          <h1 className="font-mono text-5xl md:text-7xl text-white font-bold tracking-tighter drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] mb-4 uppercase">
            {selectedGame?.title}
          </h1>

          {/* Playtime */}
          {selectedGame?.playtime > 0 && !isSpecialCard && (
            <div className="font-mono text-sm text-cyan-300/80 tracking-[0.2em] mb-6">
              TIME.ELAPSED // {Math.floor(selectedGame.playtime / 3600)}H{' '}
              {Math.floor((selectedGame.playtime % 3600) / 60)}M
            </div>
          )}

          {!isSpecialCard && (
            <div className="flex items-center gap-4 pointer-events-auto">
              <button
                onClick={() => {
                  playLaunch();
                  onPlay(selectedGame);
                }}
                className="nexus-btn bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 px-10 py-3 font-mono font-bold text-sm hover:bg-cyan-400 hover:text-black transition-all uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,255,255,0.2)]"
              >
                Initialize
              </button>
              <button
                onClick={() => onEdit(selectedGame)}
                className="nexus-btn w-12 h-12 bg-black/50 border border-cyan-500/30 flex items-center justify-center text-cyan-500 hover:bg-cyan-900/50 hover:border-cyan-400 transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => onDelete(selectedGame)}
                className="nexus-btn w-12 h-12 bg-black/50 border border-cyan-500/30 flex items-center justify-center text-red-500 hover:bg-red-900/50 hover:border-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
              {selectedGame?.isSteam && (
                <button
                  onClick={() => {
                    api
                      .getAchievements(selectedGame.steamId)
                      .then(onViewAchievements)
                      .catch(console.error);
                  }}
                  className="nexus-btn w-12 h-12 bg-black/50 border border-cyan-500/30 flex items-center justify-center text-magenta-500 hover:bg-fuchsia-900/50 hover:border-fuchsia-400 transition-colors"
                  style={{ color: '#ff00ff' }}
                >
                  <Trophy size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Cybernetic Status Bar */}
        <div
          className={`absolute top-8 left-1/2 -translate-x-1/2 flex gap-12 font-mono text-xs text-cyan-500/50 tracking-[0.2em] pointer-events-none transition-opacity duration-1000 ${uiOpacityClass}`}
        >
          <span>SYS.ONLINE</span>
          <span>NEURAL.LINK: ACTIVE</span>
          <span>LATENCY: 4ms</span>
        </div>
      </div>
    );
  }
);

export default NexusLayout;
