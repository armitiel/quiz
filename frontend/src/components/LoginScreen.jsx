import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import ErrorBanner from './ErrorBanner.jsx';
import Spinner from './Spinner.jsx';
import PrivacyPolicyModal from './PrivacyPolicyModal.jsx';

export default function LoginScreen() {
  const { loginUser, loginAdmin } = useAuth();
  const [mode, setMode] = useState('user');
  const [firstName,   setFirstName]   = useState('');
  const [lastName,    setLastName]    = useState('');
  const [classLevel,  setClassLevel]  = useState('');
  const [login,       setLogin]       = useState('');
  const [password,    setPassword]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [returningUser, setReturningUser] = useState(false);
  const [showPrivacy,   setShowPrivacy]   = useState(false);

  // Auto-detekcja powracającego ucznia (po imieniu+nazwisku)
  useEffect(() => {
    if (mode !== 'user') return;
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (fn.length < 2 || ln.length < 2) {
      setReturningUser(false);
      return;
    }
    const timer = setTimeout(() => {
      api.checkUser(fn, ln)
        .then((data) => setReturningUser(!!data.exists))
        .catch(() => setReturningUser(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [firstName, lastName, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'user') {
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error('Wpisz imię i nazwisko');
        }
        if (!classLevel) {
          throw new Error('Wybierz swoją klasę');
        }
        await loginUser(firstName.trim(), lastName.trim(), '', classLevel);
      } else {
        if (!login.trim() || !password) {
          throw new Error('Wpisz login i hasło');
        }
        await loginAdmin(login.trim(), password);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">

        <div className="card animate-pop-in p-8 md:p-10">

          {/* === Hero === */}
          <div className="text-center mb-6">
            <div className="text-5xl md:text-6xl mb-2 flex items-end justify-center gap-3">
              <span className="text-4xl md:text-5xl">🌲</span>
              <span>🦊</span>
              <span className="text-4xl md:text-5xl">🌳</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold text-ink mb-1">Leśny Quiz</h1>
            <p className="text-ink-muted text-sm md:text-base">Witaj w lesie pełnym pytań!</p>
          </div>

          {/* === Role toggle === */}
          <div className="flex bg-forest-100 rounded-pill p-1 mb-6 gap-1" role="tablist">
            <button type="button"
              onClick={() => { setMode('user'); setError(null); }}
              className={`flex-1 py-3 px-4 rounded-pill font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'user' ? 'toggle-active' : 'text-ink-muted'
              }`}>
              <span>🌰</span> Dziecko
            </button>
            <button type="button"
              onClick={() => { setMode('admin'); setError(null); }}
              className={`flex-1 py-3 px-4 rounded-pill font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'admin' ? 'toggle-active' : 'text-ink-muted'
              }`}>
              <span>🍄</span> Admin
            </button>
          </div>

          <ErrorBanner error={error} onDismiss={() => setError(null)} />

          {loading ? <Spinner label="Loguję..." /> : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'user' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block font-medium text-ink mb-2 text-sm md:text-base">
                        Twoje imię:
                      </label>
                      <input type="text" className="input-kid"
                        placeholder="np. Ania"
                        value={firstName} onChange={(e) => setFirstName(e.target.value)}
                        maxLength={50} autoFocus autoComplete="given-name" />
                    </div>
                    <div>
                      <label className="block font-medium text-ink mb-2 text-sm md:text-base">
                        Twoje nazwisko:
                      </label>
                      <input type="text" className="input-kid"
                        placeholder="np. Kowalska"
                        value={lastName} onChange={(e) => setLastName(e.target.value)}
                        maxLength={50} autoComplete="family-name" />
                    </div>
                  </div>

                  {returningUser && (
                    <div className="bg-forest-100 border-2 border-forest-500 rounded-2xl p-3 flex items-center gap-3 animate-slide-down">
                      <span className="text-2xl">🦊</span>
                      <p className="text-sm md:text-base text-ink font-medium flex-1">
                        Witamy z powrotem, <strong>{firstName.trim()}</strong>!
                      </p>
                    </div>
                  )}

                  {/* Wybór klasy */}
                  <div>
                    <label className="block font-medium text-ink mb-2 text-sm md:text-base">
                      Twoja klasa: <span className="text-coral">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: '1-3', emoji: '🌱', label: 'Klasy 1-3', desc: 'Łatwiejsze pytania' },
                        { val: '4-6', emoji: '🌳', label: 'Klasy 4-6', desc: 'Trudniejsze pytania' },
                      ].map((opt) => {
                        const sel = classLevel === opt.val;
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setClassLevel(opt.val)}
                            className={`flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all ${
                              sel
                                ? 'border-forest-500 bg-forest-100 scale-[1.03] shadow-soft'
                                : 'border-forest-200 bg-white hover:border-forest-400'
                            }`}
                          >
                            <span className="text-3xl md:text-4xl">{opt.emoji}</span>
                            <span className="font-bold text-ink text-base">{opt.label}</span>
                            <span className="text-xs text-ink-muted">{opt.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-medium text-ink mb-2 text-sm md:text-base">Login:</label>
                    <input type="text" className="input-kid"
                      value={login} onChange={(e) => setLogin(e.target.value)}
                      autoFocus autoComplete="username" />
                  </div>
                  <div>
                    <label className="block font-medium text-ink mb-2 text-sm md:text-base">Hasło:</label>
                    <input type="password" className="input-kid"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password" />
                  </div>
                </>
              )}

              <button type="submit"
                disabled={mode === 'user' && (!firstName.trim() || !lastName.trim() || !classLevel)}
                className="btn-primary w-full mt-6">
                {mode === 'user' ? <>Zaczynamy! <span>🌿</span></> : <>Zaloguj <span>🔑</span></>}
              </button>
            </form>
          )}
        </div>

        {/* === Stopka z polityką prywatności === */}
        <footer className="text-center mt-5 px-2">
          <p className="text-xs md:text-sm text-ink-muted">
            Administrator danych: <strong>Stowarzyszenie Pomost</strong>
          </p>
          <button
            type="button"
            onClick={() => setShowPrivacy(true)}
            className="text-xs md:text-sm text-forest-700 hover:underline mt-1 font-medium"
          >
            📜 Polityka prywatności i RODO
          </button>
        </footer>
      </div>

      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  );
}
