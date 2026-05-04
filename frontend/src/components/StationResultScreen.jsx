/**
 * Wynik pojedynczej stacji (np. 3/3, 2/3, 0/3).
 * Pokazuje gwiazdki za zdobyte punkty + komunikat motywujący.
 * Przycisk "Następna stacja" lub "Zobacz wynik końcowy".
 */
export default function StationResultScreen({
  station,
  stationNumber,
  totalStations,
  score,
  total,
  isLastStation,
  onNext,
}) {
  // Gwiazdki zdobyte
  const stars = Array.from({ length: total }, (_, i) => i < score);

  let message;
  if (score === total)        message = 'Świetnie! Wszystkie pytania!';
  else if (score >= total/2)  message = 'Dobra robota!';
  else                        message = 'Próbuj dalej, każdy się uczy!';

  return (
    <div className="card animate-pop-in text-center max-w-2xl mx-auto p-8 md:p-10">
      <div className="text-ink-muted text-sm mb-2">
        Stacja {stationNumber} z {totalStations} - ukończona
      </div>

      <div className="flex items-center gap-2 justify-center mb-3">
        <span className="text-3xl">{station.icon}</span>
        <h2 className="text-xl md:text-2xl font-semibold text-ink">{station.name}</h2>
      </div>

      {/* Wynik pill */}
      <div className="score-display my-6 inline-flex">
        <span className="text-3xl md:text-5xl font-semibold text-forest-500">{score}</span>
        <span className="text-base md:text-xl">/ {total} punktów</span>
      </div>

      {/* Gwiazdki */}
      <div className="flex justify-center gap-2 my-5">
        {stars.map((earned, i) => (
          <span key={i} className="text-4xl md:text-5xl"
                style={{
                  animation: `star-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.15 + i * 0.15}s backwards`,
                  filter: earned ? 'none' : 'grayscale(1) opacity(0.3)',
                }}>
            {earned ? '⭐' : '☆'}
          </span>
        ))}
      </div>

      <p className="text-ink-muted text-base md:text-lg mb-6">
        {message}
      </p>

      <button onClick={onNext} className="btn-primary text-lg md:text-xl">
        {isLastStation
          ? <>Zobacz wynik końcowy <span>🏆</span></>
          : <>Następna stacja <span>→</span></>}
      </button>

      <style>{`
        @keyframes star-pop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
