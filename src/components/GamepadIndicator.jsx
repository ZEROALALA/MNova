import React from 'react';
import { Gamepad2 } from 'lucide-react';

export default function GamepadIndicator({ connected }) {
  if (!connected) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/50 rounded-full animate-pulse-slow">
      <Gamepad2 size={16} />
      <span className="text-xs font-bold tracking-wider">P1</span>
    </div>
  );
}
