import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { api } from './api.js';
import LoginScreen from './components/LoginScreen.jsx';
import StationIntroScreen from './components/StationIntroScreen.jsx';
import StationQuizScreen from './components/StationQuizScreen.jsx';
import StationResultScreen from './components/StationResultScreen.jsx';
import ResultScreen from './components/ResultScreen.jsx';
import LeaderboardScreen from './components/LeaderboardScreen.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import Spinner from './components/Spinner.jsx';

/**
 * Główny router. Sekwencyjny flow gry:
 *   login → intro_1 → quiz_1 → result_1 → intro_2 → quiz_2 → result_2 → ... → final
 *
 * Stacje są pobierane z backendu (/api/v1/stations) i przechodzone w kolejności.
 */
export default function App() {
  const { user, logout } = useAuth();

  const [stations,         setStations]         = useState([]);
  const [stationIdx,       setStationIdx]       = useState(0); // 0..3
  const [phase,            setPhase]            = useState('login'); // login | intro | quiz | station_result | final | leaderboard | admin
  const [stationResults,   setStationResults]   = useState([]);  // [{station, score, total}]
  const [stationsLoading,  setStationsLoading]  = useState(false);

  // Po zalogowaniu pobierz listę stacji (raz na sesję)
  useEffect(() => {
    if (!user) {
      setPhase('login');
      setStationIdx(0);
      setStationResults([]);
      return;
    }
    if (user.role === 'admin') {
      setPhase('admin');
      return;
    }
    // user
    if (stations.length === 0 && !stationsLoading) {
      setStationsLoading(true);
      api.getStations()
        .then((d) => {
          setStations(d.stations);
          setPhase('intro');
        })
        .finally(() => setStationsLoading(false));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setStations([]);
    setStationIdx(0);
    setStationResults([]);
    setPhase('login');
  };

  const goToNextStation = () => {
    const nextIdx = stationIdx + 1;
    if (nextIdx >= stations.length) {
      setPhase('final');
    } else {
      setStationIdx(nextIdx);
      setPhase('intro');
    }
  };

  const handlePlayAgain = () => {
    setStationIdx(0);
    setStationResults([]);
    setPhase('intro');
  };

  // === RENDER ===
  if (!user) return <LoginScreen />;

  // Liczba zdobytych punktów total
  const totalScore = stationResults.reduce((s, r) => s + r.score, 0);
  const totalMax   = stationResults.reduce((s, r) => s + r.total, 0);
  const finalResult = totalMax > 0 ? {
    score:   totalScore,
    total:   totalMax,
    percent: Math.round((totalScore / totalMax) * 100),
  } : null;

  return (
    <div className="min-h-full px-4 py-6 flex flex-col items-center gap-5">
      <header className="app-bar max-w-4xl lg:max-w-5xl">
        <span className="flex items-center gap-2 text-ink text-base md:text-lg">
          <span className="text-xl">🦊</span>
          <span className="font-medium">{user.first_name} {user.last_name}</span>
          {user.role === 'admin' && (
            <span className="ml-2 text-xs px-3 py-1 rounded-pill bg-wood-400 text-white font-medium">admin</span>
          )}
          {user.class_level && user.role !== 'admin' && (
            <span className="ml-2 text-xs px-3 py-1 rounded-pill bg-forest-100 text-ink font-medium">
              klasy {user.class_level}
            </span>
          )}
        </span>
        <button onClick={handleLogout}
          className="flex items-center gap-1 text-ink-muted px-3 py-1.5 rounded-pill hover:bg-forest-100 transition-colors">
          Wyloguj <span>🚪</span>
        </button>
      </header>

      <main className="w-full max-w-4xl lg:max-w-5xl">
        {stationsLoading && <Spinner label="Wczytuję stacje..." />}

        {phase === 'admin' && <AdminPanel />}

        {phase === 'intro' && stations[stationIdx] && (
          <StationIntroScreen
            station={stations[stationIdx]}
            stationNumber={stationIdx + 1}
            total={stations.length}
            onStart={() => setPhase('quiz')}
          />
        )}

        {phase === 'quiz' && stations[stationIdx] && (
          <StationQuizScreen
            stationId={stations[stationIdx].id}
            onFinish={(res) => {
              setStationResults((prev) => [...prev, res]);
              setPhase('station_result');
            }}
          />
        )}

        {phase === 'station_result' && stationResults.length > 0 && (
          <StationResultScreen
            station={stationResults[stationResults.length - 1].station}
            stationNumber={stationIdx + 1}
            totalStations={stations.length}
            score={stationResults[stationResults.length - 1].score}
            total={stationResults[stationResults.length - 1].total}
            isLastStation={stationIdx === stations.length - 1}
            onNext={goToNextStation}
          />
        )}

        {phase === 'final' && finalResult && (
          <ResultScreen
            result={finalResult}
            stationResults={stationResults}
            onPlay={handlePlayAgain}
            onLeaderboard={() => setPhase('leaderboard')}
          />
        )}

        {phase === 'leaderboard' && (
          <LeaderboardScreen onPlay={handlePlayAgain} />
        )}
      </main>
    </div>
  );
}
