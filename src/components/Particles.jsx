import React, { useEffect, useState } from 'react';

export default function Particles({ count = 40 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15, // 15s to 35s
      delay: Math.random() * -20, // Negative delay so they are already on screen
      opacity: Math.random() * 0.4 + 0.1,
      drift: (Math.random() - 0.5) * 100, // -50px to 50px drift
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen"
      style={{ zIndex: 5 }}
    >
      <style>
        {`
          @keyframes global-particle-float {
            0% { transform: translateY(110vh) translateX(0); opacity: 0; }
            10% { opacity: var(--max-opacity); }
            90% { opacity: var(--max-opacity); }
            100% { transform: translateY(-10vh) translateX(var(--drift)); opacity: 0; }
          }
        `}
      </style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: 0,
            width: `${p.size}px`,
            height: `${p.size}px`,
            '--max-opacity': p.opacity,
            '--drift': `${p.drift}px`,
            animation: `global-particle-float ${p.duration}s linear ${p.delay}s infinite`,
            boxShadow: `0 0 ${p.size * 3}px rgba(255,255,255,0.8)`,
          }}
        />
      ))}
    </div>
  );
}
