import { useState, useEffect, useRef } from 'react';

export default function useGamepad(onAction) {
  const [connected, setConnected] = useState(false);
  const activeButtons = useRef(new Set());
  const latestGamepadRef = useRef(null);

  useEffect(() => {
    let animationFrame;

    const checkGamepad = () => {
      const gamepads = navigator.getGamepads();
      let isAnyConnected = false;
      const currentFrameActive = new Set();

      let activeGamepad = null;

      const checks = [
        { action: 'LEFT', check: (gp) => gp.buttons[14]?.pressed || gp.axes[0] < -0.5 },
        { action: 'RIGHT', check: (gp) => gp.buttons[15]?.pressed || gp.axes[0] > 0.5 },
        { action: 'UP', check: (gp) => gp.buttons[12]?.pressed || gp.axes[1] < -0.5 },
        { action: 'DOWN', check: (gp) => gp.buttons[13]?.pressed || gp.axes[1] > 0.5 },
        { action: 'CONFIRM', check: (gp) => gp.buttons[0]?.pressed }, // A / Cross
        { action: 'BACK', check: (gp) => gp.buttons[1]?.pressed }, // B / Circle
        { action: 'SQUARE', check: (gp) => gp.buttons[2]?.pressed }, // X / Square
        { action: 'TRIANGLE', check: (gp) => gp.buttons[3]?.pressed }, // Y / Triangle
        { action: 'L1', check: (gp) => gp.buttons[4]?.pressed },
        { action: 'R1', check: (gp) => gp.buttons[5]?.pressed },
      ];

      for (const gp of gamepads) {
        if (!gp) continue;
        isAnyConnected = true;
        activeGamepad = gp;

        for (const { action, check } of checks) {
          if (check(gp)) {
            currentFrameActive.add(action);
          }
        }
      }
      latestGamepadRef.current = activeGamepad;

      for (const { action } of checks) {
        if (currentFrameActive.has(action)) {
          if (!activeButtons.current.has(action)) {
            onAction(action);
            activeButtons.current.add(action);
          }
        } else {
          activeButtons.current.delete(action);
        }
      }

      setConnected(isAnyConnected);
      animationFrame = requestAnimationFrame(checkGamepad);
    };

    const handleConnect = () => {
      setConnected(true);
      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.focusWindow().catch(() => {});
      }
    };
    const handleDisconnect = () => {
      const gamepads = navigator.getGamepads();
      setConnected(Array.from(gamepads).some((gp) => gp !== null));
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    animationFrame = requestAnimationFrame(checkGamepad);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
      cancelAnimationFrame(animationFrame);
    };
  }, [onAction]);

  const vibrate = (duration = 50, weak = 0.5, strong = 0) => {
    const gp = latestGamepadRef.current;
    if (gp && gp.vibrationActuator) {
      try {
        gp.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: duration,
          weakMagnitude: weak,
          strongMagnitude: strong,
        });
      } catch (e) {
        // Ignore unsupported haptics
      }
    }
  };

  return { connected, vibrate };
}
