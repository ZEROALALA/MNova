import React, { useEffect, useState, useRef } from 'react';

export default function VideoPlayerOverlay({ videoUrls = [], isVisible, onPlayingChange }) {
  const [shouldPlay, setShouldPlay] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);

  // Normalize single string to array if needed for backward compatibility
  const urls = Array.isArray(videoUrls) ? videoUrls : (videoUrls ? [videoUrls] : []);

  // 3-second delay before playing
  useEffect(() => {
    let timer;
    // Immediately stop playing and fade UI back in when the source changes
    setShouldPlay(false);
    if (onPlayingChange) onPlayingChange(false);
    
    if (isVisible && urls.length > 0) {
      timer = setTimeout(() => {
        setShouldPlay(true);
        if (onPlayingChange) onPlayingChange(true);
      }, 3000);
    } else {
      setCurrentIndex(0); // reset index when hidden
    }
    
    return () => {
      clearTimeout(timer);
      if (onPlayingChange) onPlayingChange(false); // Ensure UI comes back if unmounted
    };
  }, [isVisible, urls.join(','), onPlayingChange]);

  const handleEnded = () => {
    if (urls.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % urls.length);
    }
  };

  if (!isVisible || urls.length === 0) {
    return null;
  }

  return (
    <div 
      className={`absolute inset-0 z-10 transition-opacity duration-1000 bg-black pointer-events-none ${shouldPlay ? 'opacity-100' : 'opacity-0'}`}
    >
      {shouldPlay && urls[currentIndex] && (
        <video 
          ref={videoRef}
          key={urls[currentIndex]}
          src={urls[currentIndex]} 
          autoPlay 
          onEnded={handleEnded}
          className="w-full h-full object-cover opacity-100"
        />
      )}
      {/* Light gradient just for basic text readability if needed */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    </div>
  );
}
