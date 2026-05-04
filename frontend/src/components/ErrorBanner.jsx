export default function ErrorBanner({ error, onRetry, onDismiss }) {
  if (!error) return null;

  return (
    <div className="bg-coral-soft border-2 border-coral rounded-2xl p-4 my-4 animate-shake">
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0">⚠️</span>
        <div className="flex-1">
          <p className="text-[#a8413a] font-medium">{error.message || 'Wystąpił błąd'}</p>
          {error.code && (
            <p className="text-xs text-[#a8413a] mt-1 opacity-70">Kod: {error.code}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3 justify-end">
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary text-sm py-2 px-4">
            🔄 Spróbuj ponownie
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="btn-secondary text-sm py-2 px-4">
            Zamknij
          </button>
        )}
      </div>
    </div>
  );
}
