import { useState, useEffect, useRef } from 'react';
import { api } from '../api.js';
import Spinner from './Spinner.jsx';
import ErrorBanner from './ErrorBanner.jsx';
import IllustrationImage from './IllustrationImage.jsx';
import StarBurst from './StarBurst.jsx';

/**
 * Quiz dla pojedynczej stacji.
 * - Pobiera N (zwykle 3) losowych pytań ze stacji
 * - Po wyborze odpowiedzi pokazuje feedback (zielone/czerwone) + tip
 * - Po wszystkich pytaniach zapisuje wynik i wywołuje onFinish({score, total})
 */
export default function StationQuizScreen({ stationId, onFinish }) {
  const [data,        setData]        = useState(null);   // { station, questions[] }
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [chosen,      setChosen]      = useState({});     // { qId: answerId }
  const [answered,    setAnswered]    = useState(false);  // true gdy uczen kliknął odpowiedź
  const [score,       setScore]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);
  const [burst,       setBurst]       = useState(null);

  useEffect(() => { loadStation(); /* eslint-disable-next-line */ }, [stationId]);

  const loadStation = async () => {
    setLoading(true);
    setError(null);
    setCurrentIdx(0);
    setChosen({});
    setAnswered(false);
    setScore(0);
    try {
      const d = await api.getStationQuestions(stationId);
      setData(d);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner label="Ładuję pytania..." />;
  if (error)   return <div className="card"><ErrorBanner error={error} onRetry={loadStation} /></div>;
  if (!data || data.questions.length === 0) return <div className="card">Brak pytań.</div>;

  const q       = data.questions[currentIdx];
  const total   = data.questions.length;
  const isLast  = currentIdx === total - 1;
  const selectedAnswerId = chosen[q.id];
  const correctAnswer    = q.answers.find((a) => a.is_correct);
  const isCorrect        = answered && selectedAnswerId === correctAnswer?.id;

  const handleSelect = (answerId) => {
    if (answered) return;
    setChosen({ ...chosen, [q.id]: answerId });
    setAnswered(true);
    if (answerId === correctAnswer?.id) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = async (e) => {
    if (!answered) return;

    if (e?.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      setBurst({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }

    if (!isLast) {
      setCurrentIdx(currentIdx + 1);
      setAnswered(false);
      return;
    }

    // Ostatnie pytanie - zapisz wynik
    setSubmitting(true);
    try {
      const answers = data.questions.map((qq) => ({
        question_id: qq.id,
        answer_id:   chosen[qq.id],
      }));
      const result = await api.submitStationResults(stationId, answers);
      onFinish({
        station: data.station,
        score:   result.score,
        total:   result.total,
      });
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  if (submitting) return <Spinner label="Sprawdzam wyniki stacji..." />;

  return (
    <>
      {burst && <StarBurst x={burst.x} y={burst.y} onDone={() => setBurst(null)} />}

      <div className="card animate-pop-in" key={q.id}>
        {/* Pasek nazwa stacji + postęp */}
        <div className="mb-5">
          <div className="flex items-center gap-2 justify-center text-ink mb-2">
            <span className="text-2xl">{data.station.icon}</span>
            <span className="text-lg md:text-xl font-semibold">{data.station.name}</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill"
              style={{ width: `${((currentIdx + 1) / total) * 100}%` }} />
          </div>
          <p className="text-center text-ink-muted mt-2 text-sm md:text-base">
            Pytanie <span className="font-semibold">{currentIdx + 1}</span> z <span className="font-semibold">{total}</span>
          </p>
        </div>

        {/* Obrazek + treść pytania */}
        <div className="md:flex md:gap-7 md:items-center mb-5">
          {q.image && (
            <div className="md:w-[260px] flex-shrink-0 mb-4 md:mb-0">
              <div className="bg-forest-100 border-[3px] border-forest-200 rounded-2xl overflow-hidden flex items-center justify-center"
                   style={{ aspectRatio: '1.1 / 1' }}>
                <IllustrationImage src={q.image} alt=""
                  className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-xl md:text-2xl lg:text-[26px] font-medium text-ink leading-tight text-center md:text-left">
              {q.text}
            </h2>
          </div>
        </div>

        {/* Feedback bubble - po odpowiedzi */}
        {answered && (
          <div className={`feedback-bubble ${isCorrect ? '' : 'wrong'} mb-5`}>
            <span className="text-3xl md:text-4xl flex-shrink-0">
              {isCorrect ? '🦊' : '🌱'}
            </span>
            <div className="flex-1">
              <div className="font-semibold text-base md:text-lg text-ink mb-1">
                {isCorrect ? 'Brawo! Świetna odpowiedź! 🌟' : 'Spróbuj zapamiętać 🌱'}
              </div>
              {q.tip && (
                <div className="text-sm md:text-base text-ink-muted leading-relaxed">
                  {q.tip}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Odpowiedzi - 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          {q.answers.map((a, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = a.id === selectedAnswerId;
            const isThisCorrect = a.is_correct;

            let cls = 'answer-tile';
            if (answered) {
              if (isThisCorrect) cls += ' answer-correct';
              else if (isSelected) cls += ' answer-wrong';
              else cls += ' answer-dimmed';
            } else if (isSelected) {
              cls += ' selected';
            }

            return (
              <button
                key={a.id}
                type="button"
                onClick={() => handleSelect(a.id)}
                disabled={answered}
                className={cls}
              >
                <span className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm flex-shrink-0 transition-all ${
                  answered && isThisCorrect ? 'bg-forest-500 text-white' :
                  answered && isSelected    ? 'bg-coral text-white' :
                  isSelected ? 'bg-forest-500 text-white' : 'bg-forest-100 text-forest-700'
                }`}>
                  {letter}
                </span>
                <span className="flex-1 text-left">{a.text}</span>
                {answered && isThisCorrect && <span className="text-forest-500 text-xl flex-shrink-0">✓</span>}
                {answered && isSelected && !isThisCorrect && <span className="text-coral text-xl flex-shrink-0">✗</span>}
              </button>
            );
          })}
        </div>

        {/* Dolny pasek - przycisk Dalej dopiero po odpowiedzi */}
        <div className="flex justify-end items-center">
          <button
            type="button"
            onClick={handleNext}
            disabled={!answered}
            className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLast ? 'Zakończ stację' : 'Dalej'} <span>→</span>
          </button>
        </div>
      </div>

      <style>{`
        .answer-correct { border-color: #5BA84C !important; background: #DDEFC9 !important; animation: pulse-correct 0.5s; }
        .answer-wrong   { border-color: #D96A5C !important; background: #F8D7D2 !important; animation: shake 0.4s; }
        .answer-dimmed  { opacity: 0.45; }
        @keyframes pulse-correct { 0%,100%{transform:scale(1);} 50%{transform:scale(1.03);} }
        @keyframes shake         { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-6px);} 75%{transform:translateX(6px);} }
      `}</style>
    </>
  );
}
