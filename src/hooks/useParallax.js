import { useRef, useEffect } from 'react';

export default function useParallax(intensity = 30, inverse = false) {
  const ref = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * intensity;
      targetY = (e.clientY / window.innerHeight - 0.5) * intensity;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      if (ref.current) {
        const x = inverse ? -currentX : currentX;
        const y = inverse ? -currentY : currentY;
        ref.current.style.transform = `translate3d(${x}px, ${y}px, 0px) scale(1.05)`;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, inverse]);

  return ref;
}
