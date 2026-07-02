import React, { useEffect, useState, useRef } from 'react';

// --- SVGs for the controllers/logos ---

const PS5Controller = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" fill="none" className="drop-shadow-[0_15px_30px_rgba(50,100,255,0.4)]">
    <defs>
      <linearGradient id="controllerGrad" x1="0" y1="0" x2="0" y2="250"><stop offset="0%" stopColor="#ffffff"/><stop offset="100%" stopColor="#e0e0e0"/></linearGradient>
      <linearGradient id="blueGlow" x1="0" y1="0" x2="400" y2="0"><stop offset="0%" stopColor="#0047BB"/><stop offset="50%" stopColor="#00e5ff"/><stop offset="100%" stopColor="#0047BB"/></linearGradient>
      <filter id="neonGlow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <path d="M 200 40 C 280 40, 330 60, 350 100 C 370 150, 360 210, 330 240 C 310 260, 280 260, 260 210 C 250 180, 230 170, 200 170 C 170 170, 150 180, 140 210 C 120 260, 90 260, 70 240 C 40 210, 30 150, 50 100 C 70 60, 120 40, 200 40 Z" fill="url(#controllerGrad)" stroke="#ffffff" strokeWidth="2" />
    <path d="M 200 170 C 230 170, 250 180, 260 210 C 265 225, 270 220, 270 200 C 270 150, 230 130, 200 130 C 170 130, 130 150, 130 200 C 130 220, 135 225, 140 210 C 150 180, 170 170, 200 170 Z" fill="#1A1A1A" />
    <path d="M 135 50 C 160 45, 240 45, 265 50 L 255 120 C 230 125, 170 125, 145 120 Z" fill="#252525" />
    <path d="M 135 50 C 160 45, 240 45, 265 50 L 255 120 C 230 125, 170 125, 145 120 Z" fill="none" stroke="url(#blueGlow)" strokeWidth="3" filter="url(#neonGlow)" />
    <circle cx="100" cy="95" r="22" fill="#e5e5e5" />
    <g fill="#404040">
      <rect x="96" y="78" width="8" height="12" rx="1.5" /><rect x="96" y="100" width="8" height="12" rx="1.5" /><rect x="78" y="91" width="12" height="8" rx="1.5" /><rect x="110" y="91" width="12" height="8" rx="1.5" />
    </g>
    <circle cx="300" cy="95" r="22" fill="#e5e5e5" />
    <g fill="#404040">
      <circle cx="300" cy="81" r="4.5" /><circle cx="300" cy="109" r="4.5" /><circle cx="286" cy="95" r="4.5" /><circle cx="314" cy="95" r="4.5" />
    </g>
    <circle cx="150" cy="160" r="22" fill="#101010" /><circle cx="150" cy="160" r="16" fill="#252525" stroke="#333" strokeWidth="1"/><circle cx="150" cy="160" r="10" fill="#1a1a1a" />
    <circle cx="250" cy="160" r="22" fill="#101010" /><circle cx="250" cy="160" r="16" fill="#252525" stroke="#333" strokeWidth="1"/><circle cx="250" cy="160" r="10" fill="#1a1a1a" />
    <path d="M 195 140 C 195 137, 205 137, 205 140 L 205 147 C 205 150, 195 150, 195 147 Z" fill="#404040"/>
  </svg>
);

const XboxController = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" fill="none" className="drop-shadow-[0_15px_30px_rgba(16,124,16,0.4)]">
    <defs>
      <linearGradient id="xbGrad" x1="0" y1="0" x2="0" y2="250"><stop offset="0%" stopColor="#303030"/><stop offset="100%" stopColor="#151515"/></linearGradient>
      <filter id="greenGlow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* Main Body */}
    <path d="M 200 40 C 280 40, 320 50, 340 90 C 360 130, 370 200, 340 240 C 310 270, 280 230, 260 200 C 240 180, 220 180, 200 180 C 180 180, 160 180, 140 200 C 120 230, 90 270, 60 240 C 30 200, 40 130, 60 90 C 80 50, 120 40, 200 40 Z" fill="url(#xbGrad)" stroke="#444" strokeWidth="2" />
    {/* Top Bumper Area */}
    <path d="M 130 30 C 160 25, 240 25, 270 30 C 290 35, 310 45, 320 60 C 270 50, 130 50, 80 60 C 90 45, 110 35, 130 30 Z" fill="#111" />
    
    {/* Xbox Button Glowing */}
    <circle cx="200" cy="75" r="16" fill="#1a1a1a" stroke="#222" strokeWidth="2" />
    <circle cx="200" cy="75" r="12" fill="none" stroke="#107C10" strokeWidth="3" filter="url(#greenGlow)"/>
    <path d="M 194 70 L 206 80 M 206 70 L 194 80" stroke="#107C10" strokeWidth="2.5" filter="url(#greenGlow)"/>

    {/* Left Analog (Top Left) */}
    <circle cx="110" cy="95" r="22" fill="#111" />
    <circle cx="110" cy="95" r="18" fill="#222" stroke="#107C10" strokeWidth="1"/>

    {/* Right Analog (Bottom Right) */}
    <circle cx="260" cy="155" r="22" fill="#111" />
    <circle cx="260" cy="155" r="18" fill="#222" stroke="#107C10" strokeWidth="1"/>

    {/* D-Pad (Bottom Left) */}
    <circle cx="135" cy="165" r="24" fill="#1a1a1a" />
    <path d="M 125 145 h 20 v 15 h 15 v 20 h -15 v 15 h -20 v -15 h -15 v -20 h 15 z" fill="#2a2a2a" stroke="#111" strokeWidth="1"/>

    {/* Action Buttons (Top Right) */}
    <circle cx="295" cy="100" r="22" fill="#1a1a1a" />
    <circle cx="295" cy="80" r="5" fill="#f2c811" /> {/* Y */}
    <circle cx="295" cy="120" r="5" fill="#107C10" /> {/* A */}
    <circle cx="275" cy="100" r="5" fill="#00a2ed" /> {/* X */}
    <circle cx="315" cy="100" r="5" fill="#e82c2a" /> {/* B */}
  </svg>
);

const NexusController = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" fill="none" className="drop-shadow-[0_0_50px_rgba(0,229,255,0.5)]">
    <defs>
      <linearGradient id="cyberGrad" x1="0" y1="0" x2="400" y2="250">
        <stop offset="0%" stopColor="#1a0033"/>
        <stop offset="50%" stopColor="#0d001a"/>
        <stop offset="100%" stopColor="#001a33"/>
      </linearGradient>
      <linearGradient id="neonCyan" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00e5ff"/>
        <stop offset="100%" stopColor="#0077ff"/>
      </linearGradient>
      <linearGradient id="neonPink" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff00ff"/>
        <stop offset="100%" stopColor="#b100ff"/>
      </linearGradient>
      <filter id="ultraGlow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    
    {/* Core Body - Angular/Cyberpunk shape */}
    <path d="M 200 40 
             L 280 40 L 330 60 L 360 110 L 350 200 L 310 240 L 270 240 L 250 190 L 200 170 
             L 150 190 L 130 240 L 90 240 L 50 200 L 40 110 L 70 60 L 120 40 Z" 
          fill="url(#cyberGrad)" stroke="url(#neonCyan)" strokeWidth="3" strokeLinejoin="bevel" filter="url(#ultraGlow)"/>
          
    {/* Inner Circuit Lines */}
    <path d="M 200 40 V 170 M 120 40 L 150 100 L 250 100 L 280 40 M 150 100 V 190 M 250 100 V 190 M 70 60 L 110 110 M 330 60 L 290 110" 
          stroke="url(#neonPink)" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.6"/>

    {/* Central Floating Nexus Core */}
    <circle cx="200" cy="110" r="30" fill="none" stroke="url(#neonCyan)" strokeWidth="3" filter="url(#ultraGlow)"/>
    <circle cx="200" cy="110" r="15" fill="url(#neonPink)" filter="url(#ultraGlow)">
      <animate attributeName="r" values="10; 20; 10" dur="2s" repeatCount="indefinite"/>
    </circle>
    <path d="M 170 110 H 230 M 200 80 V 140" stroke="#fff" strokeWidth="2" filter="url(#ultraGlow)"/>

    {/* Left Holographic D-Pad */}
    <g transform="translate(100, 110)">
      <polygon points="0,-25 15,-10 -15,-10" fill="url(#neonCyan)" filter="url(#ultraGlow)"/>
      <polygon points="0,25 15,10 -15,10" fill="url(#neonCyan)" filter="url(#ultraGlow)"/>
      <polygon points="-25,0 -10,15 -10,-15" fill="url(#neonCyan)" filter="url(#ultraGlow)"/>
      <polygon points="25,0 10,15 10,-15" fill="url(#neonCyan)" filter="url(#ultraGlow)"/>
    </g>

    {/* Right Holographic Action Buttons */}
    <g transform="translate(300, 110)">
      <circle cx="0" cy="-20" r="8" fill="none" stroke="url(#neonPink)" strokeWidth="3" filter="url(#ultraGlow)"/>
      <circle cx="0" cy="20" r="8" fill="none" stroke="url(#neonPink)" strokeWidth="3" filter="url(#ultraGlow)"/>
      <circle cx="-20" cy="0" r="8" fill="none" stroke="url(#neonPink)" strokeWidth="3" filter="url(#ultraGlow)"/>
      <circle cx="20" cy="0" r="8" fill="none" stroke="url(#neonPink)" strokeWidth="3" filter="url(#ultraGlow)"/>
    </g>

    {/* Left Analog Stick (Floating Rings) */}
    <g transform="translate(140, 180)">
      <ellipse cx="0" cy="0" rx="25" ry="15" fill="none" stroke="url(#neonCyan)" strokeWidth="2" filter="url(#ultraGlow)"/>
      <ellipse cx="0" cy="-10" rx="15" ry="8" fill="url(#neonPink)" opacity="0.8" filter="url(#ultraGlow)"/>
    </g>

    {/* Right Analog Stick (Floating Rings) */}
    <g transform="translate(260, 180)">
      <ellipse cx="0" cy="0" rx="25" ry="15" fill="none" stroke="url(#neonCyan)" strokeWidth="2" filter="url(#ultraGlow)"/>
      <ellipse cx="0" cy="-10" rx="15" ry="8" fill="url(#neonPink)" opacity="0.8" filter="url(#ultraGlow)"/>
    </g>
    
    {/* Floating Trigger Accents */}
    <path d="M 100 20 L 140 10 L 160 30" fill="none" stroke="url(#neonPink)" strokeWidth="4" filter="url(#ultraGlow)"/>
    <path d="M 300 20 L 260 10 L 240 30" fill="none" stroke="url(#neonPink)" strokeWidth="4" filter="url(#ultraGlow)"/>
  </svg>
);

const SpatialController = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" fill="none" className="drop-shadow-[0_0_40px_rgba(212,0,255,0.8)]">
    <defs>
      <linearGradient id="spatialGlass" x1="0" y1="0" x2="400" y2="250">
        <stop offset="0%" stopColor="rgba(255,255,255,0.1)"/>
        <stop offset="100%" stopColor="rgba(212,0,255,0.4)"/>
      </linearGradient>
      <linearGradient id="spatialNeon" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00e5ff"/>
        <stop offset="100%" stopColor="#d400ff"/>
      </linearGradient>
      <filter id="glassBlur">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    
    <g transform="translate(0, 5)">
      {/* Floating Holographic Rings behind the controller */}
      <g stroke="url(#spatialNeon)" strokeWidth="1" fill="none" opacity="0.4">
        <animateTransform attributeName="transform" type="rotate" values="0 200 125; 360 200 125" dur="15s" repeatCount="indefinite" />
        <circle cx="200" cy="125" r="140" strokeDasharray="10 20" />
        <circle cx="200" cy="125" r="160" strokeDasharray="50 40" />
      </g>
      
      {/* Main Glass Body - Sleek curved gamepad */}
      <path d="M 80 80 C 130 50, 270 50, 320 80 C 370 110, 380 180, 340 220 C 310 250, 260 180, 200 180 C 140 180, 90 250, 60 220 C 20 180, 30 110, 80 80 Z" 
            fill="url(#spatialGlass)" stroke="url(#spatialNeon)" strokeWidth="3" filter="url(#glassBlur)" />
      
      {/* Left Holographic Thumbstick */}
      <circle cx="120" cy="110" r="25" fill="rgba(0,0,0,0.4)" stroke="#00e5ff" strokeWidth="2" />
      <circle cx="120" cy="110" r="15" fill="url(#spatialNeon)" opacity="0.8">
        <animateTransform attributeName="transform" type="translate" values="0,0; -5,-5; 5,5; 0,0" dur="3s" repeatCount="indefinite" />
      </circle>
      
      {/* Right Holographic Thumbstick */}
      <circle cx="280" cy="150" r="25" fill="rgba(0,0,0,0.4)" stroke="#d400ff" strokeWidth="2" />
      <circle cx="280" cy="150" r="15" fill="url(#spatialNeon)" opacity="0.8">
        <animateTransform attributeName="transform" type="translate" values="0,0; 5,-5; -5,5; 0,0" dur="4s" repeatCount="indefinite" />
      </circle>

      {/* D-Pad (Left) */}
      <g fill="none" stroke="#00e5ff" strokeWidth="4" opacity="0.9" transform="translate(100, 160)">
        <path d="M 0 -12 L 0 -4 M 0 4 L 0 12 M -12 0 L -4 0 M 4 0 L 12 0" />
      </g>

      {/* Action Buttons (Right) */}
      <g fill="none" stroke="#d400ff" strokeWidth="3" opacity="0.9" transform="translate(280, 100)">
        <circle cx="0" cy="-15" r="4" />
        <circle cx="0" cy="15" r="4" />
        <circle cx="-15" cy="0" r="4" />
        <circle cx="15" cy="0" r="4" />
      </g>

      {/* Center Spatial Touchpad */}
      <rect x="160" y="70" width="80" height="50" rx="10" fill="rgba(255,255,255,0.05)" stroke="url(#spatialNeon)" strokeWidth="1.5" />
      <path d="M 170 95 L 230 95" stroke="#fff" strokeWidth="2" opacity="0.5">
        <animate attributeName="opacity" values="0.1;1;0.1" dur="2s" repeatCount="indefinite"/>
      </path>
      
      {/* Dynamic Floating Triggers */}
      <path d="M 100 70 C 100 30, 150 40, 150 40 L 140 70 Z" fill="url(#spatialNeon)" opacity="0.4" />
      <path d="M 300 70 C 300 30, 250 40, 250 40 L 260 70 Z" fill="url(#spatialNeon)" opacity="0.4" />
    </g>
  </svg>
);

export default function StartupScreen({ theme = 'ps5', onFinish }) {
  const [phase, setPhase] = useState('black');
  const canvasRef = useRef(null);

  // Sound Synthesizer
  useEffect(() => {
    if (phase === 'black') return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const t = ctx.currentTime;
      const dest = ctx.destination;

      if (phase === 'logo') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t); 
        osc.frequency.exponentialRampToValueAtTime(50, t + 1.5); 
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 1.5);
      } 
      else if (phase === 'scene') {
        if (theme === 'ps5') {
          // PS5: Majestic choral/ambient pad
          const baseFreq = 220; 
          [0, 4, 7, 12, 16].forEach((semitone, i) => { 
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = baseFreq * Math.pow(2, semitone / 12);
            osc.detune.value = (Math.random() - 0.5) * 15; // Chorusing
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.12 / (i + 1), t + 1.5); 
            gain.gain.setValueAtTime(0.12 / (i + 1), t + 2.5);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 4);
            osc.connect(gain);
            gain.connect(dest);
            osc.start(t);
            osc.stop(t + 4);
          });
        } else if (theme === 'xbox') {
          // Xbox: Deep Sub Bass Drop + crisp click
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(30, t + 2); 
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1000, t);
          filter.frequency.exponentialRampToValueAtTime(50, t + 2);
          
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 3);
          
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 3);
          
          // Crisp impact click
          const clickOsc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          clickOsc.type = 'sine';
          clickOsc.frequency.setValueAtTime(2000, t);
          clickOsc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
          clickGain.gain.setValueAtTime(0.5, t);
          clickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
          clickOsc.connect(clickGain);
          clickGain.connect(dest);
          clickOsc.start(t);
          clickOsc.stop(t + 0.1);
        } else if (theme === 'nexus') {
          // Nexus: Cyberpunk digital scan / glitch
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          
          // Rapid frequency modulation (glitching data stream)
          for(let i=0; i<30; i++) {
              osc.frequency.setValueAtTime(100 + Math.random()*1500, t + i*0.08);
          }
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(500, t);
          filter.frequency.linearRampToValueAtTime(4000, t + 2.5);
          filter.Q.value = 5;
          
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.15, t + 0.1);
          gain.gain.setValueAtTime(0.15, t + 2.0);
          gain.gain.linearRampToValueAtTime(0.01, t + 2.5);
          
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 2.5);
        } else if (theme === 'coverflow') {
          // Coverflow: Deep ambient spatial pad
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(65.41, t); // C2
          osc2.frequency.setValueAtTime(130.81, t); // C3
          osc2.detune.setValueAtTime(5, t);
          
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.3, t + 1.5);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 4);
          
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(dest);
          osc1.start(t);
          osc2.start(t);
          osc1.stop(t + 4);
          osc2.stop(t + 4);
        }
      } else if (phase === 'zoom-out') {
        // Zoom-out: Whoosh / Wind riser
        const bufferSize = ctx.sampleRate * 1.0;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1; // White noise
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, t);
        filter.frequency.exponentialRampToValueAtTime(4000, t + 0.8); 
        filter.Q.value = 2;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.4);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.8);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        noise.start(t);
      }
    } catch (e) {
      console.error("Audio generation failed", e);
    }
  }, [phase, theme]);

  useEffect(() => {
    // Dynamic Timeline
    const t1 = setTimeout(() => setPhase('logo'), 500);
    const t2 = setTimeout(() => setPhase('scene'), 2000);
    const t3 = setTimeout(() => setPhase('zoom-out'), 5000);
    const t4 = setTimeout(() => onFinish(), 5800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onFinish]);

  // Background Animations
  useEffect(() => {
    if (phase === 'black' || phase === 'logo') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let time = 0;
    let animId;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;
      ctx.save();

      if (theme === 'ps5') {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(5, 10, 30, 0)');
        gradient.addColorStop(0.5, 'rgba(20, 60, 180, 0.25)');
        gradient.addColorStop(1, 'rgba(50, 100, 255, 0.15)');
        
        ctx.beginPath(); ctx.moveTo(0, canvas.height);
        for (let i = 0; i <= canvas.width; i += 20) {
          ctx.lineTo(i, canvas.height * 0.6 + Math.sin(i * 0.005 + time) * 120 + Math.cos(i * 0.002 - time * 2) * 60);
        }
        ctx.lineTo(canvas.width, canvas.height); ctx.lineTo(0, canvas.height);
        ctx.fillStyle = gradient; ctx.fill();
        
        ctx.beginPath(); ctx.moveTo(0, canvas.height);
        for (let i = 0; i <= canvas.width; i += 20) {
          ctx.lineTo(i, canvas.height * 0.75 + Math.sin(i * 0.004 - time * 1.5) * 90);
        }
        ctx.lineTo(canvas.width, canvas.height); ctx.lineTo(0, canvas.height);
        ctx.fillStyle = 'rgba(100, 150, 255, 0.1)'; ctx.fill();

      } else if (theme === 'xbox') {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(10, 30, 10, 0)');
        gradient.addColorStop(0.5, 'rgba(16, 124, 16, 0.3)');
        gradient.addColorStop(1, 'rgba(50, 200, 50, 0.1)');
        
        ctx.beginPath(); ctx.moveTo(0, canvas.height);
        for (let i = 0; i <= canvas.width; i += 20) {
          ctx.lineTo(i, canvas.height * 0.5 + Math.sin(i * 0.003 + time * 2) * 150);
        }
        ctx.lineTo(canvas.width, canvas.height); ctx.lineTo(0, canvas.height);
        ctx.fillStyle = gradient; ctx.fill();

      } else if (theme === 'nexus') {
        // Cyber Grid Lines
        ctx.strokeStyle = 'rgba(177, 0, 255, 0.15)';
        ctx.lineWidth = 2;
        const perspective = time * 50;
        for (let i = 0; i < canvas.height; i += 40) {
          ctx.beginPath();
          ctx.moveTo(0, (i + perspective) % canvas.height);
          ctx.lineTo(canvas.width, (i + perspective) % canvas.height);
          ctx.stroke();
        }
        for (let i = 0; i < canvas.width; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvas.height);
          ctx.stroke();
        }
        // Glowing overlay
        const glow = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 100, canvas.width/2, canvas.height/2, 800);
        glow.addColorStop(0, 'rgba(0, 229, 255, 0.1)');
        glow.addColorStop(1, 'rgba(177, 0, 255, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (theme === 'coverflow') {
        // Deep space / spatial dots moving in 3D perspective
        ctx.fillStyle = 'rgba(10, 0, 20, 1)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for(let i = 0; i < 200; i++) {
          const x = (Math.sin(i * 100 + time) * canvas.width/2) + canvas.width/2;
          const y = (Math.cos(i * 123 + time * 0.5) * canvas.height/2) + canvas.height/2;
          const z = (Math.sin(i * 300 + time * 2) + 1) * 2;
          ctx.beginPath();
          ctx.arc(x, y, z, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [phase, theme]);

  return (
    <>
      <style>
        {`
          @keyframes glowShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
          .shimmer-ps5 { background: linear-gradient(90deg, rgba(255,255,255,0.7) 0%, #fff 40%, #80bfff 50%, #fff 60%, rgba(255,255,255,0.7) 100%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: glowShimmer 3s linear infinite; }
          .shimmer-xbox { background: linear-gradient(90deg, rgba(255,255,255,0.7) 0%, #fff 40%, #107C10 50%, #fff 60%, rgba(255,255,255,0.7) 100%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: glowShimmer 3s linear infinite; }
          .shimmer-nexus { background: linear-gradient(90deg, #00e5ff 0%, #b100ff 40%, #fff 50%, #b100ff 60%, #00e5ff 100%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: glowShimmer 3s linear infinite; }
          .shimmer-coverflow { background: linear-gradient(90deg, #d400ff 0%, #fff 40%, #4a00e0 50%, #fff 60%, #d400ff 100%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: glowShimmer 3s linear infinite; }
        `}
      </style>
      <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black" style={{ opacity: phase === 'zoom-out' ? 0 : 1, transition: 'opacity 0.8s ease-in-out', pointerEvents: 'none' }}>
        
        <canvas ref={canvasRef} className="absolute inset-0" style={{ opacity: (phase === 'scene' || phase === 'zoom-out') ? 1 : 0, transition: 'opacity 1.5s ease' }} />

        {/* Phase 1: MNova Logo */}
        <div className="absolute z-10 flex flex-col items-center gap-6" style={{ opacity: phase === 'logo' ? 1 : 0, transform: phase === 'black' ? 'scale(0.9)' : 'scale(1)', transition: 'all 0.5s ease-in-out' }}>
          <div className="relative">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <defs><linearGradient id="mGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ffffff"/><stop offset="100%" stopColor="#c0c0d0"/></linearGradient></defs>
              <path d="M20 90V35L40 65L60 35L80 65L100 35V90" stroke="url(#mGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="60" cy="25" r="5" fill="url(#mGrad)" />
            </svg>
          </div>
          <span className="text-4xl font-light tracking-[0.4em] text-white/90" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '10px' }}>MNOVA</span>
        </div>

        {/* Phase 2: Theme Scene */}
        <div className="absolute z-20 flex flex-col items-center justify-center w-full h-full" style={{ opacity: phase === 'scene' ? 1 : 0, transform: phase === 'zoom-out' ? 'scale(3) translateY(20px)' : (phase === 'scene' ? 'scale(1)' : 'scale(0.9)'), transition: phase === 'zoom-out' ? 'all 0.8s cubic-bezier(0.8, 0, 0.2, 1)' : 'all 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          
          {theme === 'ps5' && (
            <>
              <div className="flex flex-col items-center mb-16 drop-shadow-2xl">
                <div className="text-7xl font-bold italic tracking-tighter shimmer-ps5" style={{ fontFamily: 'Arial, sans-serif' }}><span className="mr-1">P</span>S5</div>
                <div className="text-white/80 text-xl font-light tracking-widest mt-1">PlayStation<span style={{fontSize: '0.6em', verticalAlign: 'super'}}>®</span>5</div>
              </div>
              <div className="relative flex items-center justify-center transform transition-transform duration-1000 hover:scale-105">
                <PS5Controller />
              </div>
            </>
          )}

          {theme === 'xbox' && (
            <>
              <div className="flex flex-col items-center mb-16 drop-shadow-2xl">
                <div className="text-7xl font-bold tracking-tighter shimmer-xbox" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>XBOX</div>
                <div className="text-white/80 text-xl font-light tracking-widest mt-1">Series X|S</div>
              </div>
              <div className="relative flex items-center justify-center transform transition-transform duration-1000 hover:scale-105">
                <XboxController />
              </div>
            </>
          )}

          {theme === 'nexus' && (
            <>
              <div className="flex flex-col items-center mb-16 drop-shadow-2xl">
                <div className="text-7xl font-bold tracking-[0.2em] shimmer-nexus" style={{ fontFamily: "'Orbitron', sans-serif" }}>NEXUS</div>
                <div className="text-cyan-400/80 text-xl font-medium tracking-[0.5em] mt-1">AI CORE SYSTEM</div>
              </div>
              <div className="relative flex items-center justify-center transform transition-transform duration-1000 hover:scale-105">
                <NexusController />
              </div>
            </>
          )}
          
          {theme === 'coverflow' && (
            <>
              <div className="flex flex-col items-center mb-16 drop-shadow-2xl">
                <div className="text-7xl font-black tracking-widest shimmer-coverflow" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>COVER FLOW</div>
                <div className="text-purple-300/80 text-xl font-medium tracking-[0.4em] mt-1">SPATIAL 3D UI</div>
              </div>
              <div className="relative flex items-center justify-center transform transition-transform duration-1000 hover:scale-105">
                <SpatialController />
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
