import { useState, useEffect } from 'react';
import WowBurst from './WowBurst.jsx';

export default function ResultScreen({ result, onPlay, onLeaderboard }) {
  if (!result) return null;
  const { score, total, percent } = result;
  const ratio = total > 0 ? score / total : 0;

  // Faza wyświetlania: 'loading' (suspense) → 'reveal' (pokaz wyniku)
  const [phase, setPhase] = useState('loading');
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showWow, setShowWow] = useState(false);

  // Po 1.8s przechodzimy do reveal + wybuch WOW
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('reveal');
      setShowWow(true);
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  // Animacja licznika punktów: od 0 do score w ciągu 1s po reveal
  useEffect(() => {
    if (phase !== 'reveal') return;
    const startTime = performance.now();
    const duration = 1000;
    let raf;

    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(eased * score));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, score]);

  // === FAZA 1: SUSPENSE ===
  if (phase === 'loading') {
    return <SuspenseScreen />;
  }

  // === FAZA 2: WYNIK ===
  // 4 tytuły zgodnie z dokumentem (przeliczone do procentów na max 12 pkt):
  //  16-20pkt z 20 → 80-100% → "Mistrz"
  //  12-15pkt z 20 → 60-75% → "Strażnik"
  //   8-11pkt z 20 → 40-55% → "Odkrywca"
  //   0-7 pkt z 20 → 0-35% → "Uczeń"
  const tier =
    ratio >= 0.80 ? 'master'   :
    ratio >= 0.60 ? 'guardian' :
    ratio >= 0.40 ? 'explorer' : 'student';

  const tierData = {
    master: {
      mascot:   '🏆',
      title:    'Leśny Mistrz!',
      subtitle: 'Las nie ma przed Tobą tajemnic!',
      message:  'Nawet dzięcioł zazdrości Ci wiedzy.',
    },
    guardian: {
      mascot:   '🦊',
      title:    'Strażnik Lasu! 🌟',
      subtitle: 'Jesteś prawdziwym leśnym tropicielem.',
      message:  'Jeszcze trochę i zostaniesz mistrzem!',
    },
    explorer: {
      mascot:   '🌳',
      title:    'Leśny Odkrywca!',
      subtitle: 'Coraz lepiej poznajesz tajemnice lasu.',
      message:  'Próbuj dalej - każdy quiz przybliża Cię do mistrzostwa!',
    },
    student: {
      mascot:   '🌱',
      title:    'Leśny Uczeń',
      subtitle: 'Każdy mistrz lasu od czegoś zaczynał.',
      message:  'Spróbuj ponownie i odkryj jeszcze więcej!',
    },
  }[tier];

  const badges = [
    { id: 'leaf',     icon: '🍂', name: 'Liścik',  earned: score >= Math.ceil(total * 0.1) },
    { id: 'acorn',    icon: '🌰', name: 'Żołądź',  earned: score >= Math.ceil(total * 0.3) },
    { id: 'mushroom', icon: '🍄', name: 'Grzybek', earned: score >= Math.ceil(total * 0.5) },
    { id: 'pine',     icon: '🌲', name: 'Szyszka', earned: score >= Math.ceil(total * 0.7) },
    { id: 'crown',    icon: '👑', name: 'Korona',  earned: score === total },
  ];

  const showConfetti = ratio >= 0.6;

  return (
    <div className="card animate-pop-in text-center p-8 md:p-12 max-w-2xl mx-auto relative overflow-hidden">
      <div className="text-7xl md:text-8xl lg:text-9xl mb-2 inline-block animate-bounce-in">
        {tierData.mascot}
      </div>

      <h1 className="text-3xl md:text-4xl lg:text-[42px] font-semibold text-ink mb-1 reveal-stage" style={{ animationDelay: '200ms' }}>
        {tierData.title}
      </h1>
      <p className="text-ink-muted text-base md:text-lg mb-7 reveal-stage" style={{ animationDelay: '350ms' }}>
        {tierData.subtitle}
      </p>

      <div className="score-display mb-8 reveal-stage" style={{ animationDelay: '500ms' }}>
        <span className="text-3xl md:text-[42px] font-semibold text-forest-500">{animatedScore}</span>
        <span>/ {total} punktów</span>
      </div>

      {/* Badges - zawsze w jednej linii (5 kolumn) */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-3 max-w-xl mx-auto mb-8">
        {badges.map((b, i) => (
          <div key={b.id}
               className={`badge-compact ${b.earned ? 'earned' : 'locked'} reveal-stage`}
               style={{ animationDelay: `${800 + i * 120}ms` }}>
            <div className="text-3xl md:text-[34px] leading-none">{b.icon}</div>
            <div className="text-[11px] md:text-[13px] font-medium text-ink mt-1">{b.name}</div>
          </div>
        ))}
      </div>

      <p className="text-ink-muted text-sm md:text-[15px] mb-7 reveal-stage" style={{ animationDelay: '1500ms' }}>
        {tierData.message}
      </p>

      <div className="flex flex-wrap gap-3 justify-center reveal-stage" style={{ animationDelay: '1700ms' }}>
        <button onClick={onLeaderboard} className="btn-secondary">
          <span>🏅</span> Tablica liderów
        </button>
        <button onClick={onPlay} className="btn-primary">
          Zagraj jeszcze raz <span>🔄</span>
        </button>
      </div>

      {showConfetti && <Confetti />}
      {showWow && <WowBurst onDone={() => setShowWow(false)} />}

      <style>{`
        .reveal-stage {
          opacity: 0;
          animation: reveal-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes reveal-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .badge-compact {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 4px;
          background: white;
          border: 2px solid #C9E4B0;
          border-radius: 16px;
          transition: transform 0.15s;
        }
        .badge-compact.earned {
          border-color: #5BA84C;
          background: #DDEFC9;
        }
        .badge-compact.locked {
          opacity: 0.4;
          filter: grayscale(0.6);
        }
      `}</style>
    </div>
  );
}

/**
 * Ekran napięcia - "Liczę punkty..." z animowanym listkiem.
 * Wyświetlany przez 1.8s przed pokazaniem wyniku.
 */
function SuspenseScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => d.length >= 3 ? '' : d + '.');
    }, 350);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card text-center p-12 md:p-16 max-w-2xl mx-auto">
      {/* Pulsujące, obracające się liście */}
      <div className="relative h-32 md:h-40 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl md:text-7xl"
               style={{ animation: 'spin-leaf 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
            🍃
          </div>
        </div>

        {/* Latające iskierki wokół */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="absolute text-2xl"
               style={{
                 animation: `orbit-${i} 2s linear infinite`,
               }}>
            ✨
          </div>
        ))}
      </div>

      <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-1">
        Sprawdzam Twoje odpowiedzi{dots}
      </h2>
      <p className="text-ink-muted text-base md:text-lg">
        Już za chwilę zobaczysz wynik
      </p>

      {/* Pasek "ładowania" - czysto wizualny */}
      <div className="mt-8 max-w-xs mx-auto">
        <div className="h-2 bg-forest-100 rounded-pill overflow-hidden">
          <div className="h-full rounded-pill"
               style={{
                 background: 'linear-gradient(90deg, #5BA84C 0%, #F5C143 50%, #5BA84C 100%)',
                 backgroundSize: '200% 100%',
                 animation: 'load-shine 1.4s linear infinite, load-fill 1.8s ease-out forwards',
                 width: '0%',
               }} />
        </div>
      </div>

      <style>{`
        @keyframes spin-leaf {
          0%, 100% { transform: rotate(-15deg) scale(1); }
          50%      { transform: rotate(15deg) scale(1.1); }
        }
        @keyframes load-fill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes load-shine {
          from { background-position: 0% 50%; }
          to   { background-position: 200% 50%; }
        }
        ${[0, 1, 2, 3, 4, 5].map((i) => `
          @keyframes orbit-${i} {
            from { transform: rotate(${i * 60}deg) translateX(80px) rotate(0deg); opacity: 0.3; }
            50%  { opacity: 1; }
            to   { transform: rotate(${i * 60 + 360}deg) translateX(80px) rotate(-360deg); opacity: 0.3; }
          }
        `).join('')}
      `}</style>
    </div>
  );
}

function Confetti() {
  const [pieces] = useState(() => {
    const colors = ['#5BA84C', '#E8A661', '#F5C143', '#D96A5C', '#6BBA5A', '#8FCFE5'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 360,
    }));
  });

  return (
    <>
      {pieces.map((p) => (
        <div key={p.id} className="confetti-piece"
          style={{
            position: 'fixed',
            top: '-20px',
            left: `${p.left}%`,
            background: p.color,
            width: p.size,
            height: p.size * 1.4,
            animation: `fall linear ${p.duration}s ${p.delay}s forwards`,
            transform: `rotate(${p.rotate}deg)`,
            borderRadius: 2,
            pointerEvents: 'none',
            zIndex: 100,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.8; }
        }
      `}</style>
    </>
  );
}
