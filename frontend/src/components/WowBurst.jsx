import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Duży, dramatyczny wybuch cząsteczek z centrum ekranu - moment "WOW".
 * Wywoływany w chwili pojawienia się wyniku (po fazie suspense).
 *
 * - 36 cząsteczek (gwiazdki + konfetti + emoji)
 * - Spread: 200-450px
 * - Duration: 1.2-2s
 * - Renderowane przez Portal w document.body
 */
export default function WowBurst({ onDone }) {
  const [particles] = useState(() => {
    const symbols = ['✨', '⭐', '🌟', '💫', '🎉', '🎊', '✨', '⭐'];
    const colors  = ['#F5C143', '#FFD93D', '#FFE066', '#5BA84C', '#8FCFE5', '#E8A661', '#D96A5C', '#6BBA5A'];

    return Array.from({ length: 36 }, (_, i) => {
      // Rozkład w 360° z lekkim losowym offsetem
      const angle = (Math.PI * 2 * i) / 36 + (Math.random() - 0.5) * 0.3;
      const distance = 180 + Math.random() * 280;       // szeroki rozrzut
      const duration = 1100 + Math.random() * 900;
      const isConfetti = Math.random() < 0.35;          // 35% to konfetti, reszta gwiazdki

      return {
        id:        i,
        symbol:    isConfetti ? null : symbols[Math.floor(Math.random() * symbols.length)],
        color:     colors[Math.floor(Math.random() * colors.length)],
        size:      isConfetti ? 10 + Math.random() * 8 : 22 + Math.random() * 18,
        endX:      Math.cos(angle) * distance,
        endY:      Math.sin(angle) * distance,
        rotate:    (Math.random() - 0.5) * 1080,
        duration,
        delay:     Math.random() * 150,
        isConfetti,
      };
    });
  });

  // Centrum ekranu
  const [center, setCenter] = useState(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  }));

  useEffect(() => {
    const onResize = () => setCenter({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Auto-cleanup po najdłuższej animacji
  useEffect(() => {
    const maxDuration = Math.max(...particles.map((p) => p.duration + p.delay));
    const t = setTimeout(() => onDone?.(), maxDuration + 100);
    return () => clearTimeout(t);
  }, [particles, onDone]);

  if (typeof document === 'undefined') return null;

  const node = (
    <div
      style={{
        position: 'fixed',
        left: center.x,
        top: center.y,
        pointerEvents: 'none',
        zIndex: 9999,
        width: 0,
        height: 0,
      }}
    >
      {/* Pulsujący flash w centrum (krótki błysk) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 200,
          height: 200,
          marginLeft: -100,
          marginTop: -100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,217,61,0.6) 0%, rgba(91,168,76,0.3) 40%, transparent 70%)',
          animation: 'wow-flash 700ms ease-out forwards',
        }}
      />

      {/* Cząsteczki */}
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            display: 'inline-block',
            ...(p.isConfetti
              ? {
                  width: p.size,
                  height: p.size * 1.6,
                  background: p.color,
                  borderRadius: 2,
                }
              : {
                  fontSize: p.size,
                  color: p.color,
                  textShadow: '0 0 12px rgba(255, 217, 61, 0.8)',
                  lineHeight: 1,
                }),
            transform: 'translate(-50%, -50%)',
            animation: `wow-fly-${p.id} ${p.duration}ms cubic-bezier(.18,.7,.4,1) ${p.delay}ms forwards`,
          }}
        >
          {p.symbol}
        </span>
      ))}

      <style>{`
        @keyframes wow-flash {
          0%   { transform: scale(0.2); opacity: 0; }
          30%  { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        ${particles.map((p) => `
          @keyframes wow-fly-${p.id} {
            0%   { transform: translate(-50%, -50%) scale(0.2) rotate(0deg); opacity: 0; }
            10%  { transform: translate(-50%, -50%) scale(1.3) rotate(${p.rotate * 0.15}deg); opacity: 1; }
            70%  { opacity: 1; }
            100% {
              transform:
                translate(calc(-50% + ${p.endX}px), calc(-50% + ${p.endY}px))
                scale(${p.isConfetti ? 0.8 : 0.4})
                rotate(${p.rotate}deg);
              opacity: 0;
            }
          }
        `).join('')}
      `}</style>
    </div>
  );

  return createPortal(node, document.body);
}
