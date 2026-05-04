import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal z polityką prywatności i klauzulą RODO.
 * Dane Stowarzyszenia Pomost - placeholder do uzupełnienia.
 */
export default function PrivacyPolicyModal({ onClose }) {
  // Zamykanie ESC
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-card shadow-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-ink flex items-center gap-2">
            📜 Polityka prywatności
          </h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink text-2xl leading-none px-2"
            aria-label="Zamknij"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm md:text-base text-ink leading-relaxed">

          <section>
            <h3 className="font-semibold text-ink mb-1">Administrator danych</h3>
            <div className="bg-forest-50 border-2 border-forest-200 rounded-xl p-3 space-y-1">
              <p><strong>Stowarzyszenie Pomost</strong></p>
              <p className="text-ink-muted">
                <em>[adres siedziby — do uzupełnienia]</em>
              </p>
              <p className="text-ink-muted">
                <em>NIP / KRS — do uzupełnienia</em>
              </p>
              <p>
                Email kontaktowy: <a href="mailto:kontakt@stowarzyszenie-pomost.pl"
                                      className="text-forest-700 underline">
                  kontakt@stowarzyszenie-pomost.pl
                </a>
                <em className="text-ink-muted text-xs ml-2">(do uzupełnienia)</em>
              </p>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-ink mb-1">Jakie dane zbieramy?</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Imię i nazwisko ucznia (podane przez dziecko przy logowaniu)</li>
              <li>Klasa (przedział: 1-3 lub 4-6)</li>
              <li>Wyniki quizu (liczba punktów per stacja, data ukończenia)</li>
            </ul>
            <p className="text-ink-muted text-xs mt-1">
              Nie zbieramy adresu, telefonu, daty urodzenia ani danych logowania (np. e-maila).
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-ink mb-1">W jakim celu?</h3>
            <p>
              Dane są przetwarzane wyłącznie w celach edukacyjnych — prowadzenia gry „Leśna Przygoda"
              i wyłonienia laureatów (top 20% najlepszych wyników w danej grupie).
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-ink mb-1">Jak długo przechowujemy dane?</h3>
            <p>
              Wyniki quizu są przechowywane na czas trwania zajęć. Po zakończeniu programu
              edukacyjnego dane są anonimizowane lub usuwane na żądanie opiekuna prawnego.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-ink mb-1">Twoje prawa (RODO)</h3>
            <p>Opiekun prawny dziecka ma prawo do:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Dostępu do danych dziecka</li>
              <li>Sprostowania nieprawidłowych danych</li>
              <li>Usunięcia danych („prawo do bycia zapomnianym")</li>
              <li>Wniesienia skargi do Prezesa UODO</li>
            </ul>
            <p className="text-ink-muted text-xs mt-2">
              Aby skorzystać z tych praw, skontaktuj się z administratorem (email powyżej).
            </p>
          </section>

          <section className="bg-forest-50 border-l-4 border-forest-500 p-3 rounded-r-xl">
            <p className="text-xs md:text-sm">
              <strong>Zgoda na uczestnictwo:</strong> Korzystanie z aplikacji przez dziecko oznacza,
              że opiekun prawny zapoznał się z niniejszą polityką prywatności i wyraża zgodę na
              przetwarzanie danych w celach edukacyjnych zgodnie z RODO.
            </p>
          </section>

          <p className="text-ink-muted text-xs text-center pt-2">
            Wersja: 1.0 | <em>Ostatnia aktualizacja: do uzupełnienia</em>
          </p>
        </div>

        <div className="mt-6 text-center">
          <button onClick={onClose} className="btn-primary">
            Rozumiem ✓
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
