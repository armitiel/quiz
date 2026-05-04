import { useState, useEffect } from 'react';
import { api } from '../api.js';
import Spinner from './Spinner.jsx';
import ErrorBanner from './ErrorBanner.jsx';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function AdminPanel() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState('');

  // TOP performers
  const [topPercent,    setTopPercent]    = useState(20);
  const [topClass,      setTopClass]      = useState(''); // '' = wszyscy, '1-3', '4-6'
  const [topDateFrom,   setTopDateFrom]   = useState('');
  const [topDateTo,     setTopDateTo]     = useState('');
  const [topData,       setTopData]       = useState(null);

  // Filtr listy wyników
  const [resClass,    setResClass]    = useState('');
  const [resSearch,   setResSearch]   = useState('');

  const flash = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const loadResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllResults();
      setResults(data.results);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadResults(); }, []);

  const loadTop = async () => {
    setError(null);
    try {
      const data = await api.getTopPerformers({
        percent:    topPercent,
        classLevel: topClass || null,
        dateFrom:   topDateFrom || null,
        dateTo:     topDateTo || null,
      });
      setTopData(data);
    } catch (err) {
      setError(err);
    }
  };

  const handleExport = async () => {
    setError(null);
    try {
      await api.downloadExport({
        classLevel: topClass || null,
        dateFrom:   topDateFrom || null,
        dateTo:     topDateTo || null,
      });
      flash('✅ Plik Excel pobrany. Sprawdź folder Pobrane.');
    } catch (err) {
      setError(err);
    }
  };

  const handleDeleteResult = async (r) => {
    if (!window.confirm(`Usunąć wynik ${r.first_name} ${r.last_name} (${r.score}/${r.total} z ${r.completed_at})?`)) return;
    try {
      await api.deleteResult(r.id);
      flash(`✅ Wynik usunięty.`);
      await loadResults();
    } catch (err) { setError(err); }
  };

  const handleResetAll = async () => {
    if (!window.confirm('Usunąć WSZYSTKIE wyniki? Tej operacji nie da się cofnąć!')) return;
    try {
      await api.resetResults();
      flash('✅ Wszystkie wyniki usunięte.');
      await loadResults();
      setTopData(null);
    } catch (err) { setError(err); }
  };

  // Filtruj listę wyników po klasie/szukaniu
  const filteredResults = results.filter((r) => {
    if (resClass && r.class_level !== resClass) return false;
    if (resSearch) {
      const q = resSearch.toLowerCase();
      const fullName = `${r.first_name} ${r.last_name}`.toLowerCase();
      if (!fullName.includes(q)) return false;
    }
    return true;
  });

  // Statystyki
  const uniqueUsers = new Set(results.map((r) => r.user_id)).size;
  const avgScore = results.length > 0
    ? (results.reduce((s, r) => s + r.score, 0) / results.length).toFixed(1)
    : '0';

  return (
    <div className="card animate-pop-in">
      <h1 className="text-3xl md:text-4xl font-semibold text-center text-ink mb-2">
        ⚙️ Panel Administratora
      </h1>

      {success && (
        <div className="bg-forest-100 border-2 border-forest-500 rounded-2xl p-3 my-4 text-center text-ink font-medium">
          {success}
        </div>
      )}
      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {/* === STATYSTYKI === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 my-6">
        <StatTile value={uniqueUsers}    label="Uczniów" />
        <StatTile value={results.length} label="Wyników" />
        <StatTile value={avgScore}       label="Średnia" />
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* === TOP X% === */}
          <Section title="🏆 TOP najlepszych - per klasa">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <Field label="Klasa">
                <select className="input-kid text-base bg-white"
                  value={topClass} onChange={(e) => setTopClass(e.target.value)}>
                  <option value="">Wszyscy</option>
                  <option value="1-3">Klasy 1-3</option>
                  <option value="4-6">Klasy 4-6</option>
                </select>
              </Field>
              <Field label="Próg">
                <select className="input-kid text-base bg-white"
                  value={topPercent} onChange={(e) => setTopPercent(Number(e.target.value))}>
                  {[10, 20, 25, 33, 50, 100].map((p) => (
                    <option key={p} value={p}>TOP {p}%</option>
                  ))}
                </select>
              </Field>
              <Field label="Od daty">
                <input type="date" className="input-kid text-base bg-white"
                  value={topDateFrom} onChange={(e) => setTopDateFrom(e.target.value)} />
              </Field>
              <Field label="Do daty">
                <input type="date" className="input-kid text-base bg-white"
                  value={topDateTo} onChange={(e) => setTopDateTo(e.target.value)} />
              </Field>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={loadTop} className="btn-primary">
                📊 Pokaż ranking
              </button>
              <button onClick={handleExport} className="btn-secondary">
                📊 Pobierz Excel (.xlsx)
              </button>
            </div>

            {topData && (
              <div className="mt-4 bg-forest-50 rounded-2xl p-4 border-2 border-forest-200">
                <p className="font-medium text-ink mb-3 text-sm md:text-base">
                  {topData.class_level && <>Klasa: <strong>{topData.class_level}</strong> · </>}
                  pokazano TOP <strong>{topData.top_count}</strong> z <strong>{topData.total_students}</strong> uczniów
                  ({topData.percent}%)
                  {topData.date_from && <> · od {topData.date_from}</>}
                  {topData.date_to   && <> · do {topData.date_to}</>}
                </p>

                {topData.performers.length === 0 ? (
                  <p className="text-ink-muted italic text-center py-4">Brak uczniów spełniających filtry.</p>
                ) : (
                  <ol className="space-y-2">
                    {topData.performers.map((p) => {
                      const isPodium = p.rank <= 3;
                      return (
                        <li key={p.user_id}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                            isPodium ? 'border-sun bg-gradient-to-r from-sun/20 to-transparent' : 'border-forest-100 bg-white'
                          }`}>
                          <span className="text-3xl w-12 text-center flex-shrink-0">
                            {MEDALS[p.rank - 1] ?? `${p.rank}.`}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-ink">{p.first_name} {p.last_name}</p>
                            <p className="text-xs md:text-sm text-ink-muted">
                              {p.class_level && <>klasa <strong>{p.class_level}</strong> · </>}
                              {p.group_symbol && <>grupa <strong>{p.group_symbol}</strong> · </>}
                              stacji: {p.stations_done}/4
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xl md:text-2xl font-semibold text-forest-700">
                              {p.total_score}<span className="text-sm text-wood-600"> / {p.max_score}</span>
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            )}
          </Section>

          {/* === WSZYSTKIE WYNIKI Z FILTREM I USUWANIEM === */}
          <Section title="📊 Wszystkie wyniki">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <Field label="Filtr klasy">
                <select className="input-kid text-base bg-white"
                  value={resClass} onChange={(e) => setResClass(e.target.value)}>
                  <option value="">Wszystkie klasy</option>
                  <option value="1-3">Klasy 1-3</option>
                  <option value="4-6">Klasy 4-6</option>
                </select>
              </Field>
              <Field label="Szukaj ucznia">
                <input type="text" placeholder="imię lub nazwisko..."
                  className="input-kid text-base bg-white"
                  value={resSearch} onChange={(e) => setResSearch(e.target.value)} />
              </Field>
            </div>

            <p className="text-sm text-ink-muted mb-2">
              Pokazano <strong>{filteredResults.length}</strong> z <strong>{results.length}</strong> wyników
            </p>

            {filteredResults.length === 0 ? (
              <p className="text-center text-ink-muted italic my-4">Brak wyników do wyświetlenia.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base">
                  <thead>
                    <tr className="bg-forest-700 text-white">
                      <th className="p-2 text-left">Data</th>
                      <th className="p-2 text-left">Uczeń</th>
                      <th className="p-2 text-left">Klasa</th>
                      <th className="p-2 text-right">Wynik</th>
                      <th className="p-2 text-center">Akcja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((r) => (
                      <tr key={r.id} className="border-b border-forest-100 hover:bg-forest-50">
                        <td className="p-2 text-ink-muted text-xs md:text-sm">{r.completed_at}</td>
                        <td className="p-2 font-medium">{r.first_name} {r.last_name}</td>
                        <td className="p-2 text-xs md:text-sm">{r.class_level || '—'}</td>
                        <td className="p-2 text-right font-semibold">
                          {r.score}<span className="text-wood-600"> / {r.total}</span>
                        </td>
                        <td className="p-2 text-center">
                          <button onClick={() => handleDeleteResult(r)}
                                  title="Usuń wpis testowy"
                                  className="text-xs px-2 py-1 rounded-pill bg-coral-soft text-[#a8413a] hover:bg-coral hover:text-white transition-colors">
                            Usuń
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* === DANGER ZONE === */}
          <Section title="🗑️ Strefa zagrożenia" danger>
            <p className="text-sm text-[#a8413a] mb-3">
              Reset wszystkich wyników (np. przed nową sesją). Operacja nieodwracalna.
            </p>
            <button onClick={handleResetAll} className="btn-danger">
              Wyczyść wszystkie wyniki
            </button>
          </Section>
        </>
      )}
    </div>
  );
}

function StatTile({ value, label }) {
  return (
    <div className="bg-gradient-to-br from-forest-400 to-forest-600 text-white p-4 rounded-2xl text-center shadow-soft">
      <div className="text-3xl font-semibold">{value}</div>
      <div className="text-xs uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">{label}</label>
      {children}
    </div>
  );
}

function Section({ title, danger = false, children }) {
  return (
    <section className={`my-6 p-4 md:p-5 rounded-2xl border-l-4 ${
      danger ? 'bg-coral-soft border-coral' : 'bg-cream border-forest-500'
    }`}>
      <h2 className={`text-xl md:text-2xl font-semibold mb-3 ${danger ? 'text-[#a8413a]' : 'text-ink'}`}>
        {title}
      </h2>
      {children}
    </section>
  );
}
