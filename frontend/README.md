# 🌲 Leśny Quiz - Frontend (React + Vite + Tailwind + PWA)

Aplikacja webowa dla iPada, instalowalna jako PWA z ekranu początkowego.

## 📁 Struktura

```
frontend/
├── package.json            # zależności i skrypty npm
├── vite.config.js          # config Vite + plugin PWA + proxy do API
├── tailwind.config.js      # paleta leśna i animacje
├── postcss.config.js
├── index.html              # iOS meta tagi (apple-mobile-web-app-*)
├── public/
│   ├── favicon.svg         # ikona master (SVG)
│   ├── icon-192.png        # PWA Android
│   ├── icon-512.png        # PWA + maskable
│   └── apple-touch-icon.png # ekran początkowy iOS (180x180)
└── src/
    ├── main.jsx            # entry point
    ├── App.jsx             # state-based router (5 ekranów)
    ├── api.js              # klient REST z JWT i obsługą błędów
    ├── index.css           # Tailwind + style komponentów
    ├── context/
    │   └── AuthContext.jsx # globalna sesja (localStorage)
    └── components/
        ├── LoginScreen.jsx
        ├── QuizScreen.jsx
        ├── ResultScreen.jsx
        ├── LeaderboardScreen.jsx
        ├── AdminPanel.jsx
        ├── Spinner.jsx
        └── ErrorBanner.jsx
```

## 🛠️ Wymagania

- **Node.js 18+** (https://nodejs.org/ - wybierz LTS)
- Backend XAMPP uruchomiony na `http://localhost/quiz/` (zobacz `../backend/README.md`)

Sprawdź że Node jest zainstalowany:
```bash
node --version    # powinno: v18+ lub v20+
npm --version
```

## 🚀 Pierwsze uruchomienie

```bash
cd frontend
npm install        # ~30 sek, instaluje React, Vite, Tailwind itd.
npm run dev        # startuje dev server na http://localhost:5173
```

W przeglądarce: `http://localhost:5173/`. Powinien się otworzyć ekran logowania z motywem leśnym.

⚠️ **Uwaga - musisz mieć też uruchomiony backend!** Inaczej zobaczysz błąd "NETWORK_ERROR".

## 📱 Testowanie na iPadzie (PWA)

To jest cały sens projektu. iPad i komputer muszą być w **tej samej sieci Wi-Fi**.

### Krok 1: Sprawdź IP komputera
W PowerShell:
```powershell
ipconfig | Select-String "IPv4"
```
Zapamiętaj adres typu `192.168.1.42`.

### Krok 2: Uruchom dev server z `--host`
```bash
npm run dev
```
Vite wyświetli linijki typu:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.42:5173/
```

### Krok 3: Otwórz w Safari na iPadzie
W iPadzie wpisz `http://192.168.1.42:5173/` (Twoje IP).

### Krok 4: Dodaj do ekranu początkowego
W Safari:
1. Tap **przycisk udostępniania** (kwadrat ze strzałką w górę, prawy górny róg)
2. Przewiń w dół → **"Do ekranu początkowego"**
3. Pokaże się ikona z lasem - tap "Dodaj"

Teraz masz **ikonę "Leśny Quiz"** na iPadzie. Tapnięcie otwiera apkę **na pełny ekran, bez paska Safari**, jak natywną aplikację.

### Co działa w trybie PWA na iOS

- ✅ Pełny ekran (bez UI Safari)
- ✅ Własna ikona na pulpicie
- ✅ Splash screen
- ✅ localStorage (zapamiętuje JWT - dziecko nie loguje się ponownie)
- ✅ Działa offline (Service Worker keszuje statyczne pliki)
- ⚠️ Wymagania API - i tak musi być sieć żeby pobrać pytania / wysłać wynik

## 🏗️ Build produkcyjny (deploy do XAMPP)

Gdy chcesz, żeby PWA działała bez Vite dev servera, zrób build statyczny:

```bash
npm run build
```

Vite stworzy folder `dist/` z gotową apką (HTML+CSS+JS minified).

Skopiuj zawartość `dist/` do `C:\xampp\htdocs\quiz\` (obok backendu):

```powershell
xcopy /E /Y dist\* C:\xampp\htdocs\quiz-app\
```

Teraz iPad otwiera `http://192.168.1.42/quiz-app/` i frontend ląduje pod tym samym Apache co backend - **bez CORS, bez proxy, bez Vite**. Aktualizacje: rebuild + xcopy.

## 🐛 Troubleshooting

| Problem | Przyczyna | Rozwiązanie |
|---|---|---|
| `NETWORK_ERROR` przy logowaniu | Backend nie działa | Sprawdź XAMPP Control Panel - zielony Apache |
| `404 Not Found` w konsoli | Złe ścieżki API w dev | Sprawdź proxy w `vite.config.js` |
| iPad nie łączy się z `192.168.x.x` | Inne sieci Wi-Fi | Oba urządzenia muszą być w **tej samej sieci** |
| Firewall blokuje | Windows Defender | Zezwól na port 5173 dla node.exe |
| Ikona PWA nieładna | Cache Safari | Usuń ikonę z pulpitu i dodaj ponownie |
| `is_correct` widoczne w przeglądarce | (nie powinno) | Sprawdź backend - `GET /questions` nie powinno tego zwracać |

## 🎨 Modyfikacja motywu

Kolory: `tailwind.config.js` → sekcja `colors.forest`, `wood`, `sun`, `sky`.

Style komponentów: `src/index.css` → klasy `btn-primary`, `card`, `answer-tile` itp.

## 🔐 Bezpieczeństwo (PWA)

- Token JWT w localStorage - utracony przy wyczyszczeniu danych Safari
- `is_correct` nie wychodzi do klienta (sprawdzanie po stronie backendu)
- Brak CORS w produkcji (frontend i backend pod tym samym Apache)
- Czas życia tokena: 24h (potem auto-wylogowanie)

## 📜 Skrypty npm

```bash
npm run dev       # dev server z hot reload (--host = dostępny w sieci)
npm run build     # statyczny build do dist/
npm run preview   # podgląd builda (port 4173)
npm run deploy    # build + przypomina o xcopy
```
