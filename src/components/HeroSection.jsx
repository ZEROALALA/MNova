import React, { useState, useEffect } from 'react';
import { Trash2, Pencil, Heart, Check } from 'lucide-react';
import AchievementsSummary from './AchievementsSummary';
import useParallax from '../hooks/useParallax';
import useAutoTrailer from '../hooks/useAutoTrailer';
import VideoPlayerOverlay from './VideoPlayerOverlay';

export default function HeroSection({
  game,
  onPlay,
  onDelete,
  onEdit,
  onViewAchievements,
  focusedActionIndex,
}) {
  const parallax = useParallax(25);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [prevBg, setPrevBg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dynamicBg, setDynamicBg] = useState(() => localStorage.getItem('mnova_dynamic_bg') !== 'false');

  useEffect(() => {
    const handleDynamicBgChanged = () => {
      setDynamicBg(localStorage.getItem('mnova_dynamic_bg') !== 'false');
    };
    window.addEventListener('dynamicBgChanged', handleDynamicBgChanged);
    return () => window.removeEventListener('dynamicBgChanged', handleDynamicBgChanged);
  }, []);

  const autoTrailer = useAutoTrailer(game);
  const videoUrlsToPlay =
    game?.videoUrls?.length > 0
      ? game.videoUrls
      : game?.videoUrl
        ? [game.videoUrl]
        : autoTrailer
          ? [autoTrailer]
          : [];

  useEffect(() => {
    if (game?.backgroundUrl && game.backgroundUrl !== prevBg) {
      setImageLoaded(false);
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
        setPrevBg(game.backgroundUrl);
      };
      img.src = game.backgroundUrl;
    }
  }, [game?.backgroundUrl]);

  if (!game) return null;

  return (
    <div className="absolute inset-0 z-0">
      {/* Background Image with Ken Burns & Parallax */}
      {dynamicBg && (
        <div className="absolute inset-0 ken-burns">
          <div
            className="absolute bg-cover bg-center transition-opacity duration-700"
            style={{
              top: '-30px',
              left: '-30px',
              right: '-30px',
              bottom: '-30px',
              transform: `translate(${parallax.x * -1}px, ${parallax.y * -1}px)`,
              backgroundImage: `url(${game.backgroundUrl})`,
              opacity: imageLoaded ? 1 : 0,
            }}
          />
        </div>
      )}

      {/* 3-Layer PS5 Gradient Overlays */}
      <div className="absolute inset-0 ps5-gradient-top" />
      <div className="absolute inset-0 ps5-gradient-bottom z-10" />
      <div className="absolute inset-0 ps5-gradient-left z-10" />

      {/* Video Background (plays underneath UI) */}
      <VideoPlayerOverlay videoUrls={videoUrlsToPlay} isVisible={true} />

      {/* Game Logo / Title */}
      <div
        className="absolute bottom-36 left-10 max-w-2xl z-20"
        style={{ animation: 'slide-up 0.5s ease-out' }}
        key={game.id} // re-trigger animation on game change
      >
        {/* Developer */}
        <h2 className="text-ps-subtext text-sm font-semibold uppercase tracking-[0.2em] mb-3">
          {game.developer}
        </h2>

        {/* Game Title / Logo */}
        <div className="flex items-center gap-4 mb-5">
          {game.logoUrl ? (
            <img
              src={game.logoUrl}
              alt={game.title}
              className="h-20 object-contain drop-shadow-2xl"
            />
          ) : (
            <h1
              className="text-5xl font-extrabold text-white leading-tight drop-shadow-2xl"
              style={{ letterSpacing: '-0.01em' }}
            >
              {game.title}
            </h1>
          )}

          {game.isFavorite && (
            <Heart
              size={32}
              className="text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]"
              fill="currentColor"
            />
          )}
        </div>

        {/* Playtime */}
        {game.playtime > 0 && (
          <div className="text-white/60 text-sm font-semibold mb-3 tracking-wide">
            PLAYTIME: {Math.floor(game.playtime / 3600)}H {Math.floor((game.playtime % 3600) / 60)}M
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-4" style={{ pointerEvents: 'auto' }}>
          <button
            onClick={onPlay}
            className={`ps5-play-btn ${focusedActionIndex === 0 ? 'ring-4 ring-white ring-offset-2 ring-offset-transparent scale-105' : ''}`}
          >
            Play Game
          </button>

          <button
            onClick={() => onEdit && onEdit(game)}
            className={`w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all text-white border ${focusedActionIndex === 1 ? 'bg-white/40 border-white ring-4 ring-white scale-110' : 'bg-white/10 border-white/20 hover:bg-white/20 hover:scale-105'}`}
            title="Edit Game"
          >
            <Pencil size={20} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirmDelete) {
                if (onDelete) onDelete(game.id);
                setConfirmDelete(false);
              } else {
                setConfirmDelete(true);
                setTimeout(() => setConfirmDelete(false), 3000);
              }
            }}
            className={`w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all text-white border ${confirmDelete ? 'bg-red-600 border-red-500 ring-4 ring-red-500 scale-110' : focusedActionIndex === 2 ? 'bg-red-500 border-red-500 ring-4 ring-red-500 scale-110' : 'bg-white/10 border-white/20 hover:bg-red-500 hover:scale-105'}`}
            title={confirmDelete ? "Click again to confirm delete" : "Delete Game"}
          >
            {confirmDelete ? <Check size={20} /> : <Trash2 size={20} />}
          </button>
        </div>
      </div>

      {/* Achievements Summary - Bottom Right */}
      <AchievementsSummary game={game} onClick={onViewAchievements} />
    </div>
  );
}
