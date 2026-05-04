# 🚀 Deploy Leśny Quiz na Vercel + Neon

Przewodnik krok po kroku - od `git init` do działającej apki na `https://twoj-projekt.vercel.app`.

---

## ✅ Status startowy (już zrobione)

- ✅ Baza Neon Postgres (Frankfurt) – schema + 40 pytań + 9 funkcji RPC
- ✅ Vercel Functions w `/api/` (Node.js + pg)
- ✅ Frontend React/Vite w `/frontend/`
- ✅ `vercel.json`, `.gitignore`, `.env.local` (lokalnie, NIE commitujemy)

---

## 1️⃣ Test lokalny (opcjonalnie, ale zalecane)

Zainstaluj **Vercel CLI** (jednorazowo):
```powershell
npm install -g vercel
```

W folderze projektu:
```powershell
cd C:\Users\DELL\Quiz
vercel dev
```

Otworzy się http://localhost:3000 z **frontendem + Vercel Functions**. Vercel sam wczyta `.env.local`.

Test:
- Zaloguj jako dziecko, wybierz klasę, zagraj quiz
- Zaloguj `admin / admin123` → panel
- Pobierz Excel z wynikami

---

## 2️⃣ GitHub – wyślij kod

### A. Utwórz konto GitHub (jeśli nie masz)

https://github.com/signup

### B. Utwórz nowe repozytorium (puste)

https://github.com/new
- Nazwa: `lesny-quiz` (lub dowolna)
- Public lub Private (Vercel obsługuje oba na free tier)
- ❌ **NIE** zaznaczaj „Add README/`.gitignore`/license" (mamy własne)
- Klik **„Create repository"**

### C. Push z lokalnej kopii

W PowerShell w folderze `C:\Users\DELL\Quiz`:

```powershell
git init
git add .
git status      # sprawdź - .env.local NIE powinien być na liście (gitignore działa)
git commit -m "Leśny Quiz - init"
git branch -M main
git remote add origin https://github.com/TWOJ_USER/lesny-quiz.git
git push -u origin main
```

⚠️ Jeśli git pyta o login – użyj **Personal Access Token** zamiast hasła
(GitHub → Settings → Developer settings → Personal access tokens → Generate).

---

## 3️⃣ Vercel – połączenie z GitHub

### A. Zaloguj na https://vercel.com (przez GitHub)

### B. „Add New Project" → wybierz repo `lesny-quiz`

### C. Konfiguracja projektu (Vercel powinien wykryć automatycznie):
- **Framework Preset**: Other (lub Vite)
- **Build Command**: `cd frontend && npm install && npm run build` (z `vercel.json`)
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install`

### D. **Environment Variables** (przed pierwszym deploy!)

Klik **„Environment Variables"** i dodaj **dwie zmienne**:

| Nazwa | Wartość |
|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_kjTeCAz1aft7@ep-polished-moon-...` |
| `JWT_SECRET` | losowy ciąg 64+ znaków (wygeneruj poniżej) |

Generowanie sekretu JWT (PowerShell):
```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Skopiuj wynik i wklej jako wartość `JWT_SECRET`.

### E. Klik **„Deploy"** → ~2 minuty

Po build dostaniesz URL typu `https://lesny-quiz-twoj.vercel.app`.

---

## 4️⃣ Auto-deploy po push

Każdy `git push origin main` **automatycznie** wdraża nową wersję.

Workflow developmentu:
```powershell
# Lokalna zmiana w kodzie...
git add .
git commit -m "Dodano funkcję XYZ"
git push

# Vercel buduje i deployuje w 30-90 sekund.
# Stara wersja działa do końca builda (zero downtime).
```

---

## 5️⃣ Domena

### Domyślna (gratis):
`https://lesny-quiz-twoj.vercel.app` – ładny, działa od razu.

### Własna (~50 zł/rok):
1. Kup `quiz.lesnaprzygoda.pl` w OVH/cyber_Folks
2. Vercel Project → **Settings** → **Domains** → wpisz domenę
3. Vercel pokaże co ustawić w DNS (CNAME / A record)
4. Konfigurujesz w panelu rejestratora
5. Po 5-60 min działa, gratis HTTPS

---

## 6️⃣ Aktualizacja schemy bazy

Gdy zmieniasz strukturę bazy (np. nowe pytania):

```powershell
# Edytuj supabase/schema.sql lub functions_neon.sql
# Potem:
node scripts/setup-db.js
```

Ten skrypt **kasuje całą bazę** i tworzy od nowa! Wyniki dzieci zostaną utracone.
Do produkcji rozważ migracje (`pg-migrate`, `node-pg-migrate`).

---

## 🛡️ Bezpieczeństwo – co zrobione, co zostało

| Aspekt | Status |
|---|---|
| HTTPS | ✅ Auto przez Vercel |
| Hashowanie hasła admina | ✅ bcrypt cost 12 |
| JWT podpisany | ✅ HS256 z secretem env |
| SQL injection | ✅ Parametryzowane przez `pg` |
| XSS w React | ✅ Auto-escape |
| `DATABASE_URL` w GitHub | ✅ `.gitignore` blokuje |
| Polityka prywatności | ✅ Modal + RODO |
| Rate limiting | ⚠️ Nie ma - można dodać Vercel WAF |
| Hasło `admin/admin123` | ⚠️ **ZMIEŃ przed udostępnieniem!** |
| `JWT_SECRET=devsecret_...` | ⚠️ **WYGENERUJ losowy w Vercel env vars** |

### Zmiana hasła admina (po deploy)

Wygeneruj nowy hash bcrypt (lokalnie):
```powershell
node -e "console.log(require('bcryptjs').hashSync('twoje_nowe_haslo', 12))"
```

Skopiuj wynik (zaczyna się od `$2a$12$...`). Wykonaj w Neon SQL Editor:
```sql
UPDATE users SET password_hash = '$2a$12$...nowy_hash...' WHERE login = 'admin';
```

---

## 📊 Co masz po deploy

```
Frontend (React PWA) ───►  https://twoj-projekt.vercel.app
                              │
                              ▼  fetch('/api/...')
Vercel Functions ─────►   /api/login, /api/stations, /api/results, ...
                              │  pg pool
                              ▼
Neon Postgres (Frankfurt) ► baza z 40 pytaniami
```

**Koszty miesięczne**: 0 zł (Vercel Hobby + Neon Free + GitHub).

**Limity free tier**:
- Vercel: 100 GB bandwidth/mies, 100h build time
- Neon: 0.5 GB storage, 100h compute
- Dla quizu z 30 dzieci dziennie zostają jeszcze ogromne marginesy.

---

## 🐛 Najczęstsze problemy

| Problem | Rozwiązanie |
|---|---|
| `DATABASE_URL not defined` w runtime | Zapomniałeś dodać env var w Vercel - dodaj i Redeploy |
| Build fails: `Cannot find module 'pg'` | Vercel nie zainstalował root deps - sprawdź `installCommand` w `vercel.json` |
| Funkcja zwraca 500 | Vercel Project → Logs → znajdź dokładny błąd |
| Polskie znaki ?? w bazie | Już naprawione (UTF-8 wszędzie) |
| iPad: brak ikon SVG | Vercel cachuje 1 dzień - hard reload (Ctrl+Shift+R) |
| Cold start trwa długo | Pierwszy request po przerwie ~1-2s, potem instant |

---

## 📞 Co robić jak coś nie działa

1. **Vercel logs**: Dashboard → Project → Deployments → klik deploy → **„Functions"** lub **„Build logs"**
2. **Konsola przeglądarki** (F12) na produkcji
3. **Test bazy**: `node scripts/check-db.js` lokalnie
4. Wróć tutaj z konkretnym błędem
