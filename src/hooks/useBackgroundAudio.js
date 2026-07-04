import { useEffect, useRef } from 'react';

export default function useBackgroundAudio(games, selectedId) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const game = games.find((g) => g.id === selectedId);
    
    if (game?.audioUrl && game.audioUrl !== audio.src) {
      const fadeOut = setInterval(() => {
        if (audio.volume > 0.1) audio.volume -= 0.1;
        else {
          clearInterval(fadeOut);
          audio.src = game.audioUrl;
          audio.play().catch(() => {});
          const fadeIn = setInterval(() => {
            if (audio.volume < 1) audio.volume += 0.1;
            else clearInterval(fadeIn);
          }, 50);
        }
      }, 50);
    } else if (!game?.audioUrl) {
      const fadeOut = setInterval(() => {
        if (audio.volume > 0.1) audio.volume -= 0.1;
        else {
          clearInterval(fadeOut);
          audio.pause();
          audio.src = '';
        }
      }, 50);
    }
  }, [selectedId, games]);

  return audioRef;
}
