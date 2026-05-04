/**
 * Ekran zapowiedzi stacji - "Stacja 2: Sekrety lasu"
 * Pokazywany przez 2-3 sekundy lub do kliknięcia "Zaczynamy".
 */
export default function StationIntroScreen({ station, stationNumber, total, onStart }) {
  return (
    <div className="card animate-pop-in text-center max-w-2xl mx-auto p-8 md:p-12">
      <div className="text-ink-muted text-sm md:text-base mb-2">
        Stacja {stationNumber} z {total}
      </div>

      <div className="text-7xl md:text-8xl mb-4 inline-block animate-bounce-in">
        {station.icon}
      </div>

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-ink mb-2">
        {station.name}
      </h1>
      {station.subtitle && (
        <p className="text-ink-muted text-base md:text-lg mb-8">
          {station.subtitle}
        </p>
      )}

      <button onClick={onStart} className="btn-primary text-lg md:text-xl mt-4">
        Zaczynamy! <span>🌿</span>
      </button>
    </div>
  );
}
