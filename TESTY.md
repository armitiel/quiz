# 🧪 Lokalne testy backendu - Leśny Quiz

Checklista 10 testów do sprawdzenia czy API działa poprawnie po lokalnej instalacji.

## ✅ Przygotowanie

Zanim zaczniesz, upewnij się że:

1. ☐ XAMPP jest zainstalowany w `C:\xampp\`
2. ☐ Uruchomiłeś `import-bazy.bat` i baza `lesny_quiz` istnieje (sprawdź w phpMyAdmin)
3. ☐ Uruchomiłeś `uruchom-quiz.bat`, Apache i MySQL pokazują **zielony status** w XAMPP Control Panel
4. ☐ Wpisując `http://localhost/quiz/` w przeglądarce widzisz JSON z opisem API

> **Wskazówka:** wszystkie testy poniżej masz też w gotowej kolekcji Postman: `backend/postman/lesny-quiz-api.postman_collection.json`. Postman wykona je automatycznie z asercjami.

---

## 🧪 Test 1: API odpowiada (smoke test)

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost/quiz/" -Method GET
```

**Oczekiwana odpowiedź:**
```
ok    : True
data  : @{name=Lesny Quiz API; version=v1; endpoints=...}
error :
```

❌ **Jeśli błąd:** sprawdź czy Apache jest uruchomiony w XAMPP, czy folder `quiz/` istnieje w `htdocs/`.

---

## 🧪 Test 2: Logowanie dziecka (auto-rejestracja)

```powershell
$body = @{ first_name = "Janek"; last_name = "Kowalski" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost/quiz/api/v1/login" -Method POST -Body $body -ContentType "application/json"
```

**Oczekiwane:** zwrócony obiekt z polem `data.token` (długi ciąg JWT) i `data.user.role = "user"`.

---

## 🧪 Test 3: Logowanie admina (poprawne hasło)

```powershell
$body = @{ login = "admin"; password = "admin123" } | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost/quiz/api/v1/login" -Method POST -Body $body -ContentType "application/json"
$result.data.user.role     # powinno wyswietlic: admin
$adminToken = $result.data.token   # zapisz token do dalszych testow
```

**Oczekiwane:** `data.user.role = "admin"`, w `$adminToken` ląduje ważny JWT.

---

## 🧪 Test 4: Logowanie admina (BŁĘDNE hasło)

```powershell
$body = @{ login = "admin"; password = "zle_haslo" } | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "http://localhost/quiz/api/v1/login" -Method POST -Body $body -ContentType "application/json"
} catch {
    $_.Exception.Response.StatusCode    # powinno: Unauthorized (401)
    $_.ErrorDetails.Message             # JSON z error.code = AUTH_FAILED
}
```

**Oczekiwane:** HTTP **401**, `error.code = "AUTH_FAILED"`.

---

## 🧪 Test 5: Pobranie pytań BEZ tokena (oczekiwany 401)

```powershell
try {
    Invoke-RestMethod -Uri "http://localhost/quiz/api/v1/questions" -Method GET
} catch {
    $_.Exception.Response.StatusCode    # powinno: Unauthorized (401)
}
```

**Oczekiwane:** HTTP **401**, `error.code = "UNAUTHORIZED"` (brak nagłówka Authorization).

---

## 🧪 Test 6: Pobranie pytań Z tokenem

```powershell
# Uzyj tokena z testu 2 lub 3
$body = @{ first_name = "Janek"; last_name = "Kowalski" } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "http://localhost/quiz/api/v1/login" -Method POST -Body $body -ContentType "application/json"
$token = $login.data.token

$headers = @{ Authorization = "Bearer $token" }
$questions = Invoke-RestMethod -Uri "http://localhost/quiz/api/v1/questions" -Method GET -Headers $headers

$questions.data.total                          # powinno: 15
$questions.data.questions.Count                # powinno: 15
$questions.data.questions[0].answers.Count     # powinno: 4
$questions.data.questions[0].answers[0].PSObject.Properties.Name | Sort-Object
# powinno wyswietlic: id, text  (BRAK is_correct - to celowe!)
```

**Oczekiwane:** 15 pytań, każde z 4 odpowiedziami. Pole `is_correct` **NIE** jest zwracane (security).

---

## 🧪 Test 7: Wysłanie wyników quizu

```powershell
# Tworzymy losowe odpowiedzi do wszystkich 15 pytan
$answers = $questions.data.questions | ForEach-Object {
    @{
        question_id = $_.id
        answer_id   = $_.answers[0].id   # zawsze pierwsza - czesc bedzie poprawna
    }
}

$body = @{ answers = $answers } | ConvertTo-Json -Depth 5
$result = Invoke-RestMethod -Uri "http://localhost/quiz/api/v1/results" -Method POST -Headers $headers -Body $body -ContentType "application/json"

$result.data.score      # liczba poprawnych (0-15)
$result.data.percent    # procent
$result.data.message    # komunikat z emoji
```

**Oczekiwane:** HTTP **201**, w odpowiedzi `score`, `total: 15`, `percent`, `message`.

---

## 🧪 Test 8: Lista wyników jako USER (oczekiwany 403)

```powershell
try {
    Invoke-RestMethod -Uri "http://localhost/quiz/api/v1/results" -Method GET -Headers $headers
} catch {
    $_.Exception.Response.StatusCode    # powinno: Forbidden (403)
}
```

**Oczekiwane:** HTTP **403**, `error.code = "FORBIDDEN"`. Tylko admin może czytać listę.

---

## 🧪 Test 9: Lista wyników jako ADMIN

```powershell
$adminHeaders = @{ Authorization = "Bearer $adminToken" }
$results = Invoke-RestMethod -Uri "http://localhost/quiz/api/v1/results" -Method GET -Headers $adminHeaders

$results.data.count                # liczba wynikow w bazie
$results.data.results | Format-Table first_name, last_name, score, completed_at
```

**Oczekiwane:** Tabela wszystkich wyników z imionami uczniów.

---

## 🧪 Test 10: Reset wyników (admin TRUNCATE)

```powershell
# UWAGA: ten test KASUJE wszystkie wyniki!
$reset = Invoke-RestMethod -Uri "http://localhost/quiz/api/v1/results" -Method DELETE -Headers $adminHeaders
$reset.data.truncated         # powinno: True

# Sprawdz, ze faktycznie jest pusto
$results = Invoke-RestMethod -Uri "http://localhost/quiz/api/v1/results" -Method GET -Headers $adminHeaders
$results.data.count           # powinno: 0
```

**Oczekiwane:** `truncated: true`, po wywołaniu `count = 0`.

---

## 📋 Wynik checklisty

Po każdym teście odhacz ✅:

- [ ] Test 1: API odpowiada
- [ ] Test 2: Logowanie dziecka
- [ ] Test 3: Logowanie admina (poprawne)
- [ ] Test 4: Logowanie admina (błędne hasło → 401)
- [ ] Test 5: Pytania bez tokena → 401
- [ ] Test 6: Pytania z tokenem (15 sztuk, brak `is_correct`)
- [ ] Test 7: Zapis wyniku (201)
- [ ] Test 8: User próbujący listy → 403
- [ ] Test 9: Admin czytający listę
- [ ] Test 10: Admin TRUNCATE

Jeśli wszystkie 10 przeszło – backend jest **gotowy do integracji z Flutter**.

---

## 🐛 Rozwiązywanie problemów

| Symptom | Przyczyna | Rozwiązanie |
|---|---|---|
| `Could not connect to localhost` | Apache nie działa | XAMPP Control Panel → Start Apache |
| `DB_CONNECTION_FAILED` | MySQL nie działa | XAMPP Control Panel → Start MySQL |
| `404 Not Found` na `/api/v1/login` | mod_rewrite wyłączony | XAMPP → Apache config → odkomentuj `LoadModule rewrite_module` |
| `INSUFFICIENT_QUESTIONS` | Baza nieskonfigurowana | Uruchom `import-bazy.bat` |
| `AUTH_FAILED` przy `admin/admin123` | Nadpisałeś hash bcrypt | Zaimportuj `schema.sql` od nowa |
| Polskie znaki jako "?" | Złe collation | Sprawdź czy `lesny_quiz` ma `utf8mb4_polish_ci` |
| `Token nieważny` | Zmieniłeś `jwt.secret` w trakcie testów | Po zmianie secretu zaloguj się ponownie aby dostać nowy token |

## 💡 Bonus: import Postman zamiast PowerShell

Jeśli wolisz GUI:
1. Pobierz Postman: https://www.postman.com/downloads/
2. Import → File → wybierz `backend/postman/lesny-quiz-api.postman_collection.json`
3. Kliknij "Run collection" - wszystkie testy wykonają się automatycznie z asercjami
