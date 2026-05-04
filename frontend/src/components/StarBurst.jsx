import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Efekt cząsteczek - 14 gwiazdek wybuchających z punktu (x, y).
 *
 * Renderowane przez React Portal w document.body żeby było niezależne
 * od ciągle remontującej się karty quizu (key={q.id}).
 *
 * Po skończeniu animacji wywołuje onDone (do usunięcia z DOM).
 */
export default function StarBurst({ x, y, onDone }) {
  const [particles] = useState(() => {
    const symbols = ['✨', '⭐', '🌟', '✨', '⭐', '💫'];
    const colors  = ['#F5C143', '#FFD93D', '#FFE066', '#5BA84C', '#8FCFE5'];
    return Array.from({ length: 14 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
      const distance = 80 + Math.random() * 80;
      const duration = 700 + Math.random() * 500;
      return {
        id:       i,
        symbol:   symbols[Math.floor(Math.random() * symbols.length)],
        color:    colors[Math.floor(Math.random() * colors.length)],
        size:     16 + Math.random() * 14,
        endX:     Math.cos(angle) * distance,
        endY:     Math.sin(angle) * distance - 30,        // bias ku górze
        rotate:   (Math.random() - 0.5) * 720,
        duration,
        delay:    Math.random() * 80,
      };
    });
  });

  // Cleanup po najdłuższej animacji
  useEffect(() => {
    const maxDuration = Math.max(...particles.map((p) => p.duration + p.delay));
    const t = setTimeout(() => onDone?.(), maxDuration + 50);
    return () => clearTimeout(t);
  }, [particles, onDone]);

  // Portal do body - przeżyje unmount karty quizu
  if (typeof document === 'undefined') return null;

  const node = (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 9999,
        width: 0,
        height: 0,
      }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            fontSize: p.size,
            color: p.color,
            transform: 'translate(-50%, -50%)',
            animation: `star-fly-${p.id} ${p.duration}ms cubic-bezier(.2,.6,.4,1) ${p.delay}ms forwards`,
            textShadow: '0 0 8px rgba(255, 217, 61, 0.6)',
          }}
        >
          {p.symbol}
        </span>
      ))}

      <style>{
        particles.map((p) => `
          @keyframes star-fly-${p.id} {
            0%   { transform: translate(-50%, -50%) scale(0.4) rotate(0deg); opacity: 0; }
            15%  { transform: translate(-50%, -50%) scale(1.2) rotate(${p.rotate * 0.2}deg); opacity: 1; }
            100% {
              transform:
                translate(calc(-50% + ${p.endX}px), calc(-50% + ${p.endY}px))
                scale(0.3) rotate(${p.rotate}deg);
              opacity: 0;
            }
          }
        `).join('')
      }</style>
    </div>
  );

  return createPortal(node, document.body);
}
