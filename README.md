# 🌲 Leśny Quiz - Projekt edukacyjny

Interaktywny quiz dla dzieci o tematyce leśnej. Architektura klient-serwer:
**Flutter (iPad) → REST API (PHP) → MySQL**.

## 📁 Struktura repozytorium

```
Quiz/
├── README.md                  <- Ten plik (przegląd projektu)
├── TESTY.md                   <- Checklista 10 testów manualnych backendu
├── uruchom-quiz.bat           <- Start: kopiuje backend do XAMPP + uruchamia usługi
├── import-bazy.bat            <- Import schema.sql do MySQL
├── zatrzymaj-quiz.bat         <- Wyłącza Apache i MySQL
├── uruchom-frontend.bat       <- Start: npm install + Vite dev server
│
├── backend/                   <- 🔧 REST API (PHP)
│   ├── README.md              <- Pełna dokumentacja API
│   ├── api/                   <- /login, /questions, /results, /leaderboard
│   ├── lib/                   <- Db, Jwt, Auth, Response, Bootstrap
│   ├── db/schema.sql          <- Baza + 30 pytań + admin bcrypt
│   ├── postman/               <- Kolekcja testowa
│   ├── config.php
│   ├── index.php
│   └── .htaccess
│
├── frontend/                  <- 🎨 React PWA dla iPada
│   ├── README.md              <- Setup, uruchomienie, deploy, troubleshooting
│   ├── package.json
│   ├── vite.config.js         <- Vite + PWA + proxy do backendu
│   ├── tailwind.config.js     <- Paleta leśna
│   ├── index.html             <- iOS meta tagi (apple-mobile-web-app-*)
│   ├── public/                <- Ikony PWA (192/512/180px) + favicon SVG
│   └── src/
│       ├── App.jsx            <- Router stateowy 5 ekranów
│       ├── api.js             <- Klient REST z JWT i obsługą błędów
│       ├── context/           <- AuthContext (sesja w localStorage)
│       └── components/        <- Login, Quiz, Result, Leaderboard, Admin
│
└── _archive_php_web/          <- 📦 ARCHIWUM: server-side PHP (poprzednia iteracja)
    ├── lesny_quiz.sql
    └── php/
```

## 🎯 Stos technologiczny

| Warstwa | Technologia | Status |
|---|---|---|
| Baza danych | MySQL 8 / MariaDB 10+ | ✅ gotowa (30 pytań) |
| Backend | PHP 8.1+ (bez frameworka, czyste PDO) | ✅ gotowy |
| Autoryzacja | JWT HS256 + bcrypt | ✅ gotowa |
| Frontend | React + Vite + Tailwind (PWA) | ✅ gotowy |
| Dystrybucja iPad | PWA - "Dodaj do ekranu początkowego" | ✅ skonfigurowana |

## 🚀 Szybki start - 4 kroki

### 1. Backend
```
1. Zainstaluj XAMPP w C:\xampp\
2. Klikni dwukrotnie:    uruchom-quiz.bat
3. Klikni dwukrotnie:    import-bazy.bat
4. Sprawdź:              http://localhost/quiz/  (powinien być JSON)
```

### 2. Frontend
```
1. Zainstaluj Node.js 18+ z https://nodejs.org/
2. Klikni dwukrotnie:    uruchom-frontend.bat
3. Sprawdź:              http://localhost:5173/  (powinien być ekran logowania)
```

### 3. iPad jako PWA
1. iPad i komputer w **tej samej Wi-Fi**
2. Sprawdź IP komputera: skrypt frontendu wyświetla je przy starcie
3. W Safari na iPadzie: `http://TWOJE_IP:5173/`
4. Udostępnij → **"Do ekranu początkowego"** → ikona z lasem na pulpicie

### 4. Test
Czytaj `TESTY.md` - 10 testów PowerShell + Postman dla backendu.

Pełna dokumentacja:
- API: [backend/README.md](backend/README.md)
- Frontend i PWA: [frontend/README.md](frontend/README.md)

## 🔐 Konta startowe

| Rola | Login | Hasło | Notatka |
|---|---|---|---|
| Admin | `admin` | `admin123` | Bcrypt cost=12 - **zmień przed produkcją!** |
| Uczeń | imię + nazwisko | – | Auto-rejestracja przy pierwszym logowaniu |

## 📊 Endpointy API (v1)

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| POST | `/api/v1/login` | – | Logowanie (dziecko lub admin) |
| GET | `/api/v1/questions` | Bearer JWT | 15 losowych pytań (bez `is_correct`) |
| POST | `/api/v1/results` | Bearer JWT (user) | Zapis odpowiedzi, serwer liczy wynik |
| GET | `/api/v1/leaderboard` | Bearer JWT | TOP 10 najlepszych wyników |
| GET | `/api/v1/results` | Bearer JWT (admin) | Lista wszystkich wyników |
| DELETE | `/api/v1/results` | Bearer JWT (admin) | TRUNCATE wyników |

## 🛣️ Roadmapa

- ✅ Schema DB v2 (30 pytań, kategorie, bcrypt)
- ✅ REST API + JWT + walidacja po stronie serwera
- ✅ Postman collection + checklista testów manualnych
- ✅ Frontend React + Vite + Tailwind (PWA)
- ✅ Konfiguracja iOS PWA (apple-touch-icon, manifest, fullscreen)
- ✅ Skrypty `.bat` do uruchomienia jednym klikiem
- ⏳ Pliki obrazów (`/img/*.jpg`) - zalecane 2 wersje (1024 i 2048 px)
- ⏳ Wdrożenie produkcyjne (HTTPS, rate limiting, ograniczone CORS)
- ⏳ Eksport wyników do CSV / Excel (panel admin)
- ⏳ Poziomy trudności / kategorie pytań do wyboru

## 🛡️ Bezpieczeństwo - co już jest

- SQL Injection: PDO prepared statements wszędzie
- Token forgery: HS256 + 32-bajtowy secret
- Cheating: `is_correct` nie wychodzi poza serwer, score liczy backend
- Information leak: globalny error handler zwraca tylko `INTERNAL_ERROR`
- Direct file access: `.htaccess` blokuje `lib/`, `db/`, `config.php`

Szczegóły i lista zadań przed produkcją: [backend/README.md](backend/README.md)
