import React from 'react';

export default function BottomHintBar() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-10 glass-panel flex items-center justify-center gap-8 z-40 text-xs">
      <span className="flex items-center gap-1.5">
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono text-[10px]">◀ ▶</kbd>
        <span className="text-white/40">Navigate</span>
      </span>
      <span className="text-white/10">|</span>
      <span className="flex items-center gap-1.5">
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono text-[10px]">Enter</kbd>
        <span className="text-white/40">Play</span>
      </span>
      <span className="text-white/10">|</span>
      <span className="flex items-center gap-1.5">
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono text-[10px]">+</kbd>
        <span className="text-white/40">Add Game</span>
      </span>
      <span className="text-white/10">|</span>
      <span className="flex items-center gap-1.5">
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono text-[10px]">Esc</kbd>
        <span className="text-white/40">Quit</span>
      </span>
    </div>
  );
}
