import { useCallback, useRef } from 'react';

export default function useSoundEffects() {
  const audioCtxRef = useRef(null);

  const playTone = useCallback((frequency, type = 'sine', duration = 0.1, volume = 0.1) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    
    // Resume context if suspended (browser auto-play policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Envelope to avoid clicks
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, []);

  const playNav = useCallback(() => playTone(440, 'sine', 0.1, 0.05), [playTone]);
  const playConfirm = useCallback(() => playTone(880, 'triangle', 0.2, 0.1), [playTone]);
  const playLaunch = useCallback(() => {
    playTone(440, 'square', 0.1, 0.1);
    setTimeout(() => playTone(660, 'square', 0.4, 0.1), 100);
  }, [playTone]);

  return { playNav, playConfirm, playLaunch };
}
