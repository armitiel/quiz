import { useState, useEffect, useRef } from 'react';
import { api } from '../api.js';
import Spinner from './Spinner.jsx';
import ErrorBanner from './ErrorBanner.jsx';
import IllustrationImage from './IllustrationImage.jsx';
import StarBurst from './StarBurst.jsx';

export default function QuizScreen({ onFinish }) {
  const [questions,    setQuestions]    = useState([]);
  const [currentIdx,   setCurrentIdx]   = useState(0);
  const [chosen,       setChosen]       = useState({});
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState(null);
  const [burst,        setBurst]        = useState(null); // { x, y } gdzie wybuch gwiazdek

  useEffect(() => { loadQuestions(); }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getQuestions();
      setQuestions(data.questions);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner label="Ładuję pytania..." />;
  if (error) {
    return (
      <div className="card">
        <ErrorBanner error={error} onRetry={loadQuestions} />
      </div>
    );
  }
  if (questions.length === 0) return <div className="card">Brak pytań w bazie.</div>;

  const q       = questions[currentIdx];
  const total   = questions.length;
  const isLast  = currentIdx === total - 1;
  const selectedAnswerId = chosen[q.id];

  const handleSelect = (answerId) => {
    setChosen({ ...chosen, [q.id]: answerId });
  };

  const handleNext = async (e) => {
    if (!selectedAnswerId) return;

    // Spawn cząsteczek z pozycji przycisku
    if (e?.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      setBurst({
        x: rect.left + rect.width / 2,
        y: rect.top  + rect.height / 2,
      });
    }

    if (!isLast) {
      setCurrentIdx(currentIdx + 1);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const answers = questions.map((qq) => ({
        question_id: qq.id,
        answer_id:   chosen[qq.id],
      }));
      const result = await api.submitResults(answers);
      onFinish(result);
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  if (submitting) return <Spinner label="Sprawdzam Twoje odpowiedzi..." />;

  return (
    <>
    {/* StarBurst poza divem z key={q.id} - przeżyje zmianę pytania */}
    {burst && (
      <StarBurst x={burst.x} y={burst.y} onDone={() => setBurst(null)} />
    )}
    <div className="card animate-pop-in" key={q.id}>
      {/* === PROGRESS BAR === */}
      <div className="mb-6">
        <div className="progress-bar-track">
          <div className="progress-bar-fill"
            style={{ width: `${((currentIdx + 1) / total) * 100}%` }} />
        </div>
        <p className="text-center text-ink mt-3 text-sm md:text-base">
          Pytanie <span className="text-lg md:text-xl font-semibold">{currentIdx + 1}</span>
          <span className="mx-1.5">z</span>
          <span className="text-lg md:text-xl font-semibold">{total}</span>
        </p>
      </div>

      {/* === GÓRA: obrazek + pytanie obok siebie na md+ === */}
      <div className="md:flex md:gap-7 md:items-center mb-6">
        {q.image && (
          <div className="md:w-[280px] flex-shrink-0 mb-4 md:mb-0">
            <div className="bg-forest-100 border-[3px] border-forest-200 rounded-2xl overflow-hidden flex items-center justify-center"
                 style={{ aspectRatio: '1.1 / 1' }}>
              <IllustrationImage src={q.image} alt=""
                className="w-full h-full object-contain" />
            </div>
          </div>
        )}

        <div className="flex-1">
          <h2 className="text-xl md:text-2xl lg:text-[28px] font-medium text-ink leading-tight text-center md:text-left">
            {q.text}
          </h2>
        </div>
      </div>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {/* === ODPOWIEDZI 2x2 === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {q.answers.map((a, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = a.id === selectedAnswerId;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => handleSelect(a.id)}
              className={`answer-tile ${isSelected ? 'selected' : ''}`}
            >
              <span className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm flex-shrink-0 transition-all ${
                isSelected ? 'bg-forest-500 text-white' : 'bg-forest-100 text-forest-700'
              }`}>
                {letter}
              </span>
              <span className="flex-1 text-left">{a.text}</span>
              {isSelected && <span className="text-forest-500 text-lg flex-shrink-0">✓</span>}
            </button>
          );
        })}
      </div>

      {/* === Przyciski === */}
      <div className="flex justify-between items-center gap-3">
        <button
          type="button"
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ visibility: currentIdx === 0 ? 'hidden' : 'visible' }}
        >
          <span>↩</span> Wstecz
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!selectedAnswerId}
          className="btn-primary"
        >
          {isLast ? 'Zakończ' : 'Dalej'} <span>→</span>
        </button>
      </div>
    </div>
    </>
  );
}
