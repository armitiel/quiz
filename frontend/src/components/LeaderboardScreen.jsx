import { useState, useEffect } from 'react';
import { api } from '../api.js';
import Spinner from './Spinner.jsx';
import ErrorBanner from './ErrorBanner.jsx';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen({ onPlay }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLeaderboard();
      setList(data.leaderboard);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Spinner label="Ładuję tablicę liderów..." />;

  return (
    <div className="card animate-pop-in max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-center text-ink">🏅 Tablica Liderów 🏅</h1>
      <p className="text-center text-ink-muted mb-6 text-base md:text-lg">Najlepsi tropiciele lasu!</p>

      <ErrorBanner error={error} onRetry={load} />

      {list.length === 0 ? (
        <p className="text-center text-gray-500 italic my-8">
          Jeszcze nikt nie ukończył quizu. Bądź pierwszy! 🌟
        </p>
      ) : (
        <ol className="space-y-2">
          {list.map((player, idx) => {
            const isPodium = idx < 3;
            return (
              <li
                key={`${player.first_name}-${player.last_name}-${idx}`}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                  isPodium
                    ? 'border-sun bg-gradient-to-r from-sun/20 to-transparent'
                    : 'border-forest-200 bg-white'
                }`}
              >
                <span className="text-3xl w-12 text-center flex-shrink-0">
                  {MEDALS[idx] ?? `${idx + 1}.`}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-ink">
                    {player.first_name} {player.last_name}
                  </p>
                  <p className="text-sm text-ink-muted">
                    Prób: {player.attempts}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-forest-700">
                    {player.best_score}
                    <span className="text-base text-wood-600"> / {player.total}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="text-center mt-6">
        <button onClick={onPlay} className="btn-primary">🌲 Zagraj quiz</button>
      </div>
    </div>
  );
}
