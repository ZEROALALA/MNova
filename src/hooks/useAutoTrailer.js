import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function useAutoTrailer(selectedGame, delay = 2000) {
  const [trailerUrl, setTrailerUrl] = useState(null);

  useEffect(() => {
    setTrailerUrl(null); 

    if (!selectedGame || selectedGame.isAddCard || selectedGame.isGridCard) return;

    // If user already provided a video, prioritize that.
    if (selectedGame.videoUrls?.length > 0 || selectedGame.videoUrl) return;
    
    // Only attempt if we have a steamId to query the Steam Store API
    if (!selectedGame.steamId) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const url = await api.getSteamTrailer(selectedGame.steamId);
        if (isMounted && url) {
          setTrailerUrl(url);
        }
      } catch (err) {
        console.error('Auto trailer fetch error:', err);
      }
    }, delay);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedGame, delay]);

  return trailerUrl;
}
