-- =====================================================================
--  LEŚNY QUIZ - Schema PostgreSQL dla Supabase
--  Wklej całość w SQL Editor (https://supabase.com/dashboard/.../sql/new)
--  i kliknij Run.
-- =====================================================================

-- Czyścimy stare obiekty jeśli ponowny import (kolejność z FK)
DROP TABLE IF EXISTS results   CASCADE;
DROP TABLE IF EXISTS answers   CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS stations  CASCADE;
DROP TABLE IF EXISTS users     CASCADE;
DROP TABLE IF EXISTS groups    CASCADE;

DROP FUNCTION IF EXISTS submit_station_result(int, int, jsonb, text, text);
DROP FUNCTION IF EXISTS get_top_performers(text, int, date, date, int);
DROP FUNCTION IF EXISTS check_user_exists(text, text);
DROP FUNCTION IF EXISTS get_station_questions(int, text);
DROP FUNCTION IF EXISTS verify_admin(text, text);


-- =====================================================================
--  TABELE
-- =====================================================================

CREATE TABLE groups (
    id          SERIAL PRIMARY KEY,
    symbol      TEXT NOT NULL UNIQUE,
    name        TEXT,
    icon        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stations (
    id        INT PRIMARY KEY,
    slug      TEXT NOT NULL UNIQUE,
    name      TEXT NOT NULL,
    subtitle  TEXT,
    icon      TEXT,
    order_no  INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_stations_order ON stations (order_no);

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    first_name    TEXT NOT NULL,
    last_name     TEXT NOT NULL,
    login         TEXT UNIQUE,
    password_hash TEXT,
    role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
    group_id      INT REFERENCES groups(id) ON DELETE SET NULL,
    class_level   TEXT CHECK (class_level IN ('1-3','4-6')),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_name  ON users (first_name, last_name);
CREATE INDEX idx_users_class ON users (class_level);

CREATE TABLE questions (
    id            INT PRIMARY KEY,
    station_id    INT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    class_level   TEXT NOT NULL CHECK (class_level IN ('1-3','4-6')),
    question_text TEXT NOT NULL,
    image_path    TEXT,
    tip           TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_q_station_class ON questions (station_id, class_level);

CREATE TABLE answers (
    id          SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct  BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_a_question ON answers (question_id);

CREATE TABLE results (
    id            SERIAL PRIMARY KEY,
    user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    station_id    INT REFERENCES stations(id) ON DELETE SET NULL,
    score         INT NOT NULL,
    total         INT NOT NULL DEFAULT 5,
    completed_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_r_user      ON results (user_id);
CREATE INDEX idx_r_station   ON results (station_id);
CREATE INDEX idx_r_completed ON results (completed_at);


-- =====================================================================
--  DANE STARTOWE: Grupy, Stacje, Admin
-- =====================================================================

INSERT INTO groups (symbol, name, icon) VALUES
('PSZCZÓŁKI',  'Grupa Pszczółki',  '/img/grupy/pszczolka.svg'),
('ŻOŁĘDZIE',   'Grupa Żołędzie',   '/img/grupy/zoladz.svg'),
('LISKI',      'Grupa Liski',      '/img/grupy/lisek.svg'),
('SOWY',       'Grupa Sowy',       '/img/grupy/sowka.svg'),
('GRZYBKI',    'Grupa Grzybki',    '/img/grupy/grzybek.svg'),
('SOSENKI',    'Grupa Sosenki',    '/img/grupy/sosenka.svg');

INSERT INTO stations (id, slug, name, subtitle, icon, order_no) VALUES
(1, 'orientacja',     'Mistrzowie orientacji', 'Kompas, mapa i kierunki',          '🧭', 1),
(2, 'sekrety-lasu',   'Sekrety lasu',          'Zwierzęta, rośliny i grzyby',      '🔍', 2),
(3, 'eko-straznicy',  'Eko-strażnicy',         'Przyroda i ochrona środowiska',    '♻️',  3),
(4, 'zawody',         'Zawody przyszłości',    'Leśnik, ekolog, ranger',           '👷', 4);

-- Admin: login=admin, hasło=admin123
-- Hash generowany przez pgcrypto (kompatybilny z crypt() w verify_admin)
-- UWAGA: pgcrypto musi być załadowane w functions_neon.sql PRZED tym INSERT
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (first_name, last_name, login, password_hash, role) VALUES
('Admin', 'Systemu', 'admin',
 crypt('admin123', gen_salt('bf', 12)),
 'admin');


-- =====================================================================
--  PYTANIA i ODPOWIEDZI - 40 sztuk (5 per stacja x 2 klasy)
--  (skrócone - pełny seed jest w schema_questions.sql, importowanym osobno)
-- =====================================================================

-- ========== STACJA 1: Mistrzowie orientacji (klasy 1-3) ==========
INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(101, 1, '1-3', 'Co warto zabrać na wycieczkę do lasu, by się nie zgubić?', '/img/mapa.svg',
 'Mapa pokazuje gdzie jesteś, a kompas - w którą stronę idziesz. Razem to świetna para!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(101,'Mapę i kompas',TRUE),(101,'Telewizor',FALSE),(101,'Lodówkę',FALSE),(101,'Kanapę',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(102, 1, '1-3', 'Igła kompasu zawsze pokazuje na tę stronę świata:', NULL,
 'Czerwona część igły kompasu zawsze wskazuje północ - dzięki temu zawsze wiesz gdzie idziesz!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(102,'Północ',TRUE),(102,'Południe',FALSE),(102,'Wschód',FALSE),(102,'Zachód',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(103, 1, '1-3', 'Z której strony pnia drzewa rośnie najwięcej mchu?', NULL,
 'Mech lubi wilgoć i cień - dlatego rośnie od strony północnej, gdzie jest mniej słońca.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(103,'Od północy',TRUE),(103,'Od południa',FALSE),(103,'Od wschodu',FALSE),(103,'Od zachodu',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(104, 1, '1-3', 'Słońce rano wschodzi na...', NULL,
 'Słońce wschodzi na wschodzie, a zachodzi na zachodzie - to łatwy sposób żeby zorientować się w terenie.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(104,'Wschodzie',TRUE),(104,'Zachodzie',FALSE),(104,'Północy',FALSE),(104,'Południu',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(105, 1, '1-3', 'Co to jest szlak turystyczny w lesie?', NULL,
 'Szlaki oznaczone są kolorami na drzewach i kamieniach. Jeśli widzisz znaki - jesteś bezpieczny!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(105,'Wyznaczona trasa oznaczona kolorowymi znakami',TRUE),
(105,'Miejsce gdzie mieszkają zwierzęta',FALSE),
(105,'Restauracja w lesie',FALSE),
(105,'Plac zabaw',FALSE);

-- ========== STACJA 2: Sekrety lasu (klasy 1-3) ==========
INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(106, 2, '1-3', 'Które z tych zwierząt zapada w sen zimowy?', '/img/niedzwiedz.svg',
 'Niedźwiedź śpi przez całą zimę w gawrze - oszczędza energię gdy nie ma jedzenia!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(106,'Niedźwiedź brunatny',TRUE),(106,'Sarna',FALSE),(106,'Wilk',FALSE),(106,'Lis',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(107, 2, '1-3', 'Który ptak puka dziobem w drzewo, szukając owadów?', '/img/dzieciol.svg',
 'Dzięcioł potrafi pukać 20 razy na sekundę! Jego mózg jest specjalnie chroniony przed wstrząsami.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(107,'Dzięcioł',TRUE),(107,'Wróbel',FALSE),(107,'Sowa',FALSE),(107,'Bocian',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(108, 2, '1-3', 'Co najczęściej jada wiewiórka?', '/img/wiewiorka.svg',
 'Wiewiórki chowają orzechy na zimę w wielu miejscach. Te których nie znajdą - wyrastają w nowe drzewa!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(108,'Orzechy i żołędzie',TRUE),(108,'Mięso',FALSE),(108,'Trawę',FALSE),(108,'Ryby',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(109, 2, '1-3', 'Który grzyb jest jadalny?', '/img/grzyby.svg',
 'Borowik to król grzybów! Ma brązowy kapelusz i białą nóżkę. Ale uwaga: zbieraj tylko z dorosłym!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(109,'Borowik szlachetny',TRUE),(109,'Muchomor czerwony',FALSE),
(109,'Muchomor sromotnikowy',FALSE),(109,'Piestrzenica kasztanowata',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(110, 2, '1-3', 'Liść którego drzewa widnieje na fladze Kanady?', '/img/klon.svg',
 'Klon ma piękne, wielobarwne liście jesienią - czerwone, pomarańczowe i żółte. Z jego soku robi się syrop klonowy!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(110,'Klon',TRUE),(110,'Dąb',FALSE),(110,'Buk',FALSE),(110,'Brzoza',FALSE);

-- ========== STACJA 3: Eko-strażnicy (klasy 1-3) ==========
INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(111, 3, '1-3', 'Dlaczego nie wolno zostawiać śmieci w lesie?', '/img/ekologia.svg',
 'Plastikowa butelka rozkłada się nawet 1000 lat! Zawsze zabieraj śmieci ze sobą.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(111,'Bo zanieczyszczają środowisko i szkodzą zwierzętom',TRUE),
(111,'Bo to nieładnie wygląda na zdjęciach',FALSE),
(111,'Bo leśniczy się zezłości',FALSE),
(111,'Bo śmieci przyciągają deszcz',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(112, 3, '1-3', 'Co produkują drzewa, czym oddychamy?', '/img/drzewo.svg',
 'Jedno duże drzewo wytwarza tlen dla 4 osób na cały rok! Dlatego trzeba dbać o lasy.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(112,'Tlen',TRUE),(112,'Dwutlenek węgla',FALSE),(112,'Azot',FALSE),(112,'Wodór',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(113, 3, '1-3', 'Co to jest park narodowy?', '/img/park.svg',
 'W Polsce mamy 23 parki narodowe. Najsłynniejsze to Tatrzański i Białowieski - dom żubrów!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(113,'Chroniony obszar przyrody, gdzie żyją rzadkie rośliny i zwierzęta',TRUE),
(113,'Plac zabaw dla dzieci',FALSE),(113,'Stadion sportowy',FALSE),
(113,'Centrum handlowe na łonie natury',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(114, 3, '1-3', 'Co powinno się zrobić, gdy spotkamy dzika w lesie?', '/img/dzik.svg',
 'Dziki najczęściej same uciekają od ludzi. Nigdy nie podchodź do młodych dzików - mama jest w pobliżu!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(114,'Spokojnie się oddalić bez krzyku',TRUE),(114,'Podbiec do niego',FALSE),
(114,'Krzyczeć i rzucać kamieniami',FALSE),(114,'Karmić go kanapką',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(115, 3, '1-3', 'Co robią pszczoły, gdy zbierają nektar z kwiatów?', '/img/pszczola.svg',
 'Pszczoły zapylają 80% roślin! Bez nich nie byłoby wielu owoców i warzyw, które jemy.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(115,'Zapylają kwiaty i produkują miód',TRUE),(115,'Niszczą rośliny',FALSE),
(115,'Budują pajęczyny',FALSE),(115,'Zjadają liście',FALSE);

-- ========== STACJA 4: Zawody przyszłości (klasy 1-3) ==========
INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(116, 4, '1-3', 'Kim jest leśnik?', NULL,
 'Leśnik dba o las jak ogrodnik o ogród - sadzi drzewa, dba o zwierzęta i pilnuje porządku.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(116,'Osoba która opiekuje się lasem i zwierzętami',TRUE),
(116,'Osoba która sprzedaje drewno',FALSE),
(116,'Osoba która tylko ścina drzewa',FALSE),
(116,'Osoba która mieszka na drzewie',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(117, 4, '1-3', 'Co robi ekolog?', NULL,
 'Ekolodzy ratują zagrożone gatunki - dzięki nim w Polsce wróciły bobry i żubry!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(117,'Bada przyrodę i pomaga ją chronić',TRUE),
(117,'Tylko czyta książki',FALSE),
(117,'Robi zakupy w sklepie',FALSE),
(117,'Buduje samochody',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(118, 4, '1-3', 'Czym zajmuje się weterynarz?', NULL,
 'Weterynarz to lekarz dla zwierząt - leczy zarówno pieski w domu, jak i dzikie zwierzęta z lasu!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(118,'Leczy zwierzęta',TRUE),(118,'Hoduje rośliny',FALSE),
(118,'Buduje domy',FALSE),(118,'Gotuje obiady',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(119, 4, '1-3', 'Co robi przewodnik górski lub leśny?', NULL,
 'Przewodnik zna teren jak własną kieszeń - dzięki niemu wycieczka jest bezpieczna i ciekawa!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(119,'Pokazuje drogę i opowiada o przyrodzie',TRUE),
(119,'Sprzedaje bilety',FALSE),(119,'Sprząta szlaki',FALSE),
(119,'Pisze książki',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(120, 4, '1-3', 'Strażak leśny pomaga gdy...', NULL,
 'W lesie najgroźniejszy jest pożar - może spalić tysiące drzew w jeden dzień. Nigdy nie pal ognia w lesie!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(120,'W lesie wybuchnie pożar',TRUE),
(120,'Drzewo urośnie za wysokie',FALSE),
(120,'Spadnie deszcz',FALSE),
(120,'Liście zmienią kolor',FALSE);

-- =====================================================================
--  PYTANIA: KLASY 4-6 (PULA 20 z dokumentu, 5 na stację - losowane 3 do gry)
-- =====================================================================

-- ========== STACJA 1: Mistrzowie orientacji (klasy 4-6) ==========
INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(201, 1, '4-6', 'Która strona kompasu wskazuje na północ?', NULL,
 'Czerwona część igły kompasu zawsze wskazuje północ. Pozostała część (biała lub czarna) - południe.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(201,'Czerwona igła',TRUE),(201,'Biała igła',FALSE),(201,'Żółta strzałka',FALSE),(201,'Zielona strzałka',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(202, 1, '4-6', 'Na mapie znalazłeś symbol niebieskiej linii falującej. Co oznacza?', NULL,
 'Mapy turystyczne mają standardowe symbole - niebieski = woda, zielony = las, brązowy = teren górzysty.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(202,'Drogę leśną',FALSE),(202,'Rzekę lub strumień',TRUE),
(202,'Granicę parku',FALSE),(202,'Szlak turystyczny',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(203, 1, '4-6', 'Jesteś zwrócony twarzą na wschód. W którą stronę masz południe?', NULL,
 'Pamiętaj: kierunki układają się zgodnie z ruchem wskazówek zegara - N (północ), E (wschód), S (południe), W (zachód).');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(203,'Na lewo',FALSE),(203,'Na prawo',TRUE),
(203,'Za plecami',FALSE),(203,'Przed tobą',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(204, 1, '4-6', 'Skala mapy wynosi 1:10 000. Odległość na mapie to 3 cm. Ile to w terenie?', NULL,
 'Skala 1:10 000 znaczy że 1 cm na mapie to 10 000 cm = 100 m w terenie. Więc 3 cm = 300 m.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(204,'30 m',FALSE),(204,'300 m',TRUE),(204,'3 km',FALSE),(204,'30 km',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(205, 1, '4-6', 'Co to są poziomice na mapie?', NULL,
 'Im poziomice są bliżej siebie - tym teren bardziej stromy. Daleko od siebie - łagodne wzniesienia.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(205,'Granice lasu',FALSE),(205,'Linie równej wysokości terenu',TRUE),
(205,'Drogi leśne',FALSE),(205,'Rzeki',FALSE);

-- ========== STACJA 2: Sekrety lasu (klasy 4-6) ==========
INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(206, 2, '4-6', 'Jak nazywa się sieć zależności pokarmowych w lesie?', NULL,
 'Sieć troficzna to skomplikowana sieć "kto kogo zjada" - od mikroorganizmów po drapieżniki na szczycie.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(206,'Sieć trakcyjna',FALSE),(206,'Sieć troficzna (łańcuch pokarmowy)',TRUE),
(206,'Cykl wodny',FALSE),(206,'Obieg materii',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(207, 2, '4-6', 'Ślady w kształcie serduszka z dwoma racicami zostawia...', '/img/tropy.svg',
 'Sarna ma mniejsze tropy (5-7 cm), jeleń większe (8-10 cm). Oba zwierzęta mają charakterystyczne dwie racice tworzące "serduszko".');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(207,'Lis',FALSE),(207,'Bóbr',FALSE),
(207,'Sarna lub jeleń',TRUE),(207,'Dzik',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(208, 2, '4-6', 'Pod korą drzewa żyje mnóstwo organizmów. Jak nazywamy to środowisko?', NULL,
 'Pod korą starego dębu można znaleźć ponad 200 gatunków! To prawdziwy "wieżowiec życia".');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(208,'Mikrokosmos kory',TRUE),(208,'Makrohabitat',FALSE),
(208,'Strefa liściowa',FALSE),(208,'Canopy',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(209, 2, '4-6', 'Jaką rolę w lesie pełnią grzyby mykoryzowe?', NULL,
 'Grzyby i drzewa żyją w symbiozie - grzyby dostarczają wodę i minerały, drzewa - cukier z fotosyntezy.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(209,'Są szkodnikami drzew',FALSE),
(209,'Łączą korzenie i dostarczają składniki odżywcze',TRUE),
(209,'Wytwarzają tlen',FALSE),(209,'Odstraszają owady',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(210, 2, '4-6', 'Ile gatunków owadów może żyć w jednym starym dębie?', '/img/dab.svg',
 'Stary dąb to prawdziwy wieżowiec życia - może być domem dla ponad 500 gatunków owadów!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(210,'Około 10',FALSE),(210,'Około 50',FALSE),
(210,'Ponad 500',TRUE),(210,'Dokładnie 100',FALSE);

-- ========== STACJA 3: Eko-strażnicy (klasy 4-6) ==========
INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(211, 3, '4-6', 'Mikroplastik w lesie pochodzi głównie z...', NULL,
 'Plastikowe butelki, opakowania i nawet ubrania syntetyczne rozpadają się na malutkie cząstki, które wnikają do gleby i wody.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(211,'Rozkładu liści',FALSE),
(211,'Fragmentacji plastikowych śmieci',TRUE),
(211,'Deszczu kwasowego',FALSE),(211,'Ropy naftowej',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(212, 3, '4-6', 'Domek dla owadów (hotel dla owadów) pomaga w...', NULL,
 'Hotele dla owadów dają schronienie pszczołom samotnym, biedronkom, motylom - wszystkim którzy zapylają nasze rośliny.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(212,'Hodowli owadów jadalnych',FALSE),
(212,'Schronieniu zapylaczy i drapieżników',TRUE),
(212,'Odstraszaniu komarów',FALSE),(212,'Dekorowaniu ogrodu',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(213, 3, '4-6', 'Co to znaczy "zostawić las w spokoju"?', NULL,
 'Zasada "zero śladu" - zostaw teren w takim stanie, w jakim go zastałeś. Nawet kamień powinien zostać tam gdzie był!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(213,'Nie wchodzić do lasu',FALSE),
(213,'Minimalizować ingerencje, nie zaśmiecać',TRUE),
(213,'Wycinać chore drzewa',FALSE),(213,'Palić ogniska',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(214, 3, '4-6', 'Śmieci zostawione w lesie mogą zalegać...', '/img/sciolka.svg',
 'Plastikowa butelka rozkłada się 450 lat, szkło aż 4000 lat! Niedopałek - 5 lat. Zabieraj wszystko ze sobą!');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(214,'Kilka dni',FALSE),(214,'Kilka tygodni',FALSE),
(214,'Kilka lat lub setki lat',TRUE),(214,'Zawsze rozkładają się szybko',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(215, 3, '4-6', 'Budując domek dla owadów, jakie materiały wybierzemy?', NULL,
 'Naturalne materiały są bezpieczne dla owadów i pięknie wyglądają w ogrodzie. Plastik mógłby się przegrzewać.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(215,'Plastik i metal',FALSE),
(215,'Naturalne: drewno, trzcina, szyszki',TRUE),
(215,'Styropian i folia',FALSE),(215,'Beton i cegły',FALSE);

-- ========== STACJA 4: Zawody przyszłości (klasy 4-6) ==========
INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(216, 4, '4-6', 'Leśnik to osoba, która...', NULL,
 'Leśnik to nie tylko strażnik lasu - planuje też wycinki, pomaga zwierzętom i prowadzi edukację przyrodniczą.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(216,'Tylko wycina drzewa',FALSE),
(216,'Zarządza lasem, chroni go i odnawia',TRUE),
(216,'Sprzedaje drewno',FALSE),(216,'Sadzi tylko drzewa owocowe',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(217, 4, '4-6', 'Ekolog bada...', NULL,
 'Ekologia to nauka o "ekosystemie" - jak rośliny, zwierzęta, woda i powietrze wpływają na siebie nawzajem.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(217,'Budowę maszyn',FALSE),
(217,'Zależności między organizmami a środowiskiem',TRUE),
(217,'Tylko rośliny w laboratorium',FALSE),(217,'Chemię przemysłową',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(218, 4, '4-6', 'Przewodnik przyrodniczy potrzebuje przede wszystkim...', NULL,
 'Dobry przewodnik nie tylko zna gatunki - umie też zaciekawić różne osoby: dzieci, dorosłych, seniorów.');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(218,'Umiejętności technicznych',FALSE),
(218,'Wiedzy o przyrodzie i komunikacji',TRUE),
(218,'Prawa jazdy na ciągnik',FALSE),(218,'Dyplomu z chemii',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(219, 4, '4-6', 'Dendrochronolog to naukowiec badający...', NULL,
 'Każdy słój to jeden rok życia drzewa - szerokie słoje to dobre lata (dużo słońca i wody), wąskie - trudne (susza).');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(219,'Drapieżniki leśne',FALSE),
(219,'Historię klimatu na podstawie słojów drzewnych',TRUE),
(219,'Grzyby leśne',FALSE),(219,'Rzeki i potoki',FALSE);

INSERT INTO questions (id, station_id, class_level, question_text, image_path, tip) VALUES
(220, 4, '4-6', 'Ranger w parku narodowym zajmuje się...', NULL,
 'Ranger pilnuje by ludzie nie szkodzili przyrodzie - i odwrotnie: by zwierzęta nie szkodziły ludziom (np. niedźwiedzie).');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(220,'Tylko sprzedażą biletów',FALSE),
(220,'Ochroną parku, edukacją i pomocą odwiedzającym',TRUE),
(220,'Budową dróg leśnych',FALSE),(220,'Tylko badaniami',FALSE);
