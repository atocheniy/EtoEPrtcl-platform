import React, { useEffect, useRef } from 'react';

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let w: number, h: number;
    
    const COUNT = 800;
    const BASE_SPEED = 1.5; 
    
    const stars = new Float32Array(COUNT * 5);

    const initStar = (i: number, randomZ = false) => {
      const idx = i * 5;
      stars[idx] = (Math.random() - 0.5) * w * 6; 
      stars[idx + 1] = (Math.random() - 0.5) * h * 6;
      stars[idx + 2] = randomZ ? Math.random() * w : 10; 
      stars[idx + 3] = Math.random() * 2 + 0.2; 
      stars[idx + 4] = Math.random() * 3 + 1.5; 
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      for (let i = 0; i < COUNT; i++) initStar(i, true);
    };

    const draw = () => {
      ctx.fillStyle = '#080808';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      for (let i = 0; i < COUNT; i++) {
        const idx = i * 5;
        
        stars[idx + 2] += BASE_SPEED * (stars[idx + 3] * 0.5);

        let x = stars[idx];
        let y = stars[idx + 1];
        let z = stars[idx + 2];
        let baseSize = stars[idx + 3];
        let glowFactor = stars[idx + 4];

        if (z >= w) {
          initStar(i, false);
          z = stars[idx + 2];
        }

        const scale = 200; 
        const px = (x / z) * scale + cx;
        const py = (y / z) * scale + cy;

        const depthOpacity = Math.max(0, 1 - z / w);
        const size = baseSize * depthOpacity * 2;

        if (px >= 0 && px <= w && py >= 0 && py <= h && size > 0.1) {
          ctx.globalCompositeOperation = 'lighter';
          
          const gradient = ctx.createRadialGradient(px, py, 0, px, py, size * glowFactor);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${depthOpacity * 0.6})`);
          gradient.addColorStop(0.2, `rgba(129, 140, 248, ${depthOpacity * 0.2})`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(px, py, size * glowFactor, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = `rgba(255, 255, 255, ${depthOpacity})`;
          ctx.beginPath();
          ctx.arc(px, py, size / 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default Starfield;