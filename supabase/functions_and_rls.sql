-- =====================================================================
--  ROZSZERZENIA + FUNKCJE RPC (zastępują logikę PHP backendu)
--  Wklej w Supabase SQL Editor PO załadowaniu schema.sql
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ----- 1. check_user_exists - publiczny lookup powracającego ucznia -----
CREATE OR REPLACE FUNCTION check_user_exists(p_first_name TEXT, p_last_name TEXT)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user RECORD;
    v_group_symbol TEXT;
    v_group_name   TEXT;
    v_group_icon   TEXT;
BEGIN
    SELECT u.id, u.class_level, u.group_id INTO v_user
    FROM users u
    WHERE u.first_name = p_first_name AND u.last_name = p_last_name AND u.role = 'user'
    LIMIT 1;

    IF v_user.id IS NULL THEN
        RETURN jsonb_build_object('exists', false);
    END IF;

    IF v_user.group_id IS NOT NULL THEN
        SELECT symbol, name, icon INTO v_group_symbol, v_group_name, v_group_icon
        FROM groups WHERE id = v_user.group_id;
    END IF;

    RETURN jsonb_build_object(
        'exists',      true,
        'class_level', v_user.class_level,
        'group',       CASE WHEN v_group_symbol IS NOT NULL THEN
            jsonb_build_object('symbol', v_group_symbol, 'name', v_group_name, 'icon', v_group_icon)
        ELSE NULL END
    );
END;
$$;
GRANT EXECUTE ON FUNCTION check_user_exists(TEXT, TEXT) TO anon, authenticated;


-- ----- 2. get_station_questions - 3 losowe pytania ze stacji -----
CREATE OR REPLACE FUNCTION get_station_questions(p_station_id INT, p_class_level TEXT)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_station RECORD;
    v_questions jsonb;
BEGIN
    SELECT id, slug, name, subtitle, icon INTO v_station FROM stations WHERE id = p_station_id;
    IF v_station.id IS NULL THEN
        RAISE EXCEPTION 'Stacja % nie istnieje', p_station_id;
    END IF;

    SELECT jsonb_agg(qa) INTO v_questions FROM (
        SELECT q.id, q.question_text AS text, q.image_path AS image, q.tip,
            (SELECT jsonb_agg(jsonb_build_object(
                       'id',         a.id,
                       'text',       a.answer_text,
                       'is_correct', a.is_correct
                   ))
             FROM (SELECT * FROM answers WHERE question_id = q.id ORDER BY RANDOM()) a
            ) AS answers
        FROM questions q
        WHERE q.station_id = p_station_id AND q.class_level = p_class_level
        ORDER BY RANDOM() LIMIT 3
    ) qa;

    RETURN jsonb_build_object(
        'station',     row_to_json(v_station),
        'class_level', p_class_level,
        'questions',   COALESCE(v_questions, '[]'::jsonb),
        'total',       COALESCE(jsonb_array_length(v_questions), 0)
    );
END;
$$;
GRANT EXECUTE ON FUNCTION get_station_questions(INT, TEXT) TO anon, authenticated;


-- ----- 3. submit_station_result - lazy create user + zapis wyniku -----
CREATE OR REPLACE FUNCTION submit_station_result(
    p_first_name   TEXT,
    p_last_name    TEXT,
    p_class_level  TEXT,
    p_station_id   INT,
    p_answers      jsonb,
    p_group_symbol TEXT DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id INT;
    v_group_id INT;
    v_score INT := 0;
    v_total INT;
    v_answer jsonb;
    v_correct_id INT;
    v_message TEXT;
    v_percent INT;
BEGIN
    IF p_first_name IS NULL OR length(trim(p_first_name)) = 0 THEN
        RAISE EXCEPTION 'Brak imienia';
    END IF;
    IF p_class_level NOT IN ('1-3', '4-6') THEN
        RAISE EXCEPTION 'Klasa musi być 1-3 lub 4-6';
    END IF;

    -- Resolve group
    IF p_group_symbol IS NOT NULL AND p_group_symbol <> '' THEN
        SELECT id INTO v_group_id FROM groups WHERE symbol = p_group_symbol;
    END IF;

    -- Find or create user (lazy create)
    SELECT id INTO v_user_id FROM users
    WHERE first_name = trim(p_first_name) AND last_name = trim(p_last_name) AND role = 'user'
    LIMIT 1;

    IF v_user_id IS NULL THEN
        INSERT INTO users (first_name, last_name, role, group_id, class_level)
        VALUES (trim(p_first_name), trim(p_last_name), 'user', v_group_id, p_class_level)
        RETURNING id INTO v_user_id;
    ELSE
        UPDATE users SET
            class_level = COALESCE(p_class_level, class_level),
            group_id    = COALESCE(v_group_id, group_id)
        WHERE id = v_user_id;
    END IF;

    v_total := jsonb_array_length(p_answers);

    FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
        SELECT id INTO v_correct_id FROM answers
        WHERE question_id = (v_answer->>'question_id')::INT AND is_correct = TRUE LIMIT 1;
        IF v_correct_id = (v_answer->>'answer_id')::INT THEN
            v_score := v_score + 1;
        END IF;
    END LOOP;

    INSERT INTO results (user_id, station_id, score, total)
    VALUES (v_user_id, p_station_id, v_score, v_total);

    v_percent := CASE WHEN v_total > 0 THEN ROUND((v_score::NUMERIC / v_total) * 100) ELSE 0 END;
    v_message := CASE
        WHEN v_percent >= 90 THEN '🏆 Mistrz Lasu!'
        WHEN v_percent >= 70 THEN '🌟 Bardzo dobrze!'
        WHEN v_percent >= 50 THEN '🌳 Dobra robota!'
        ELSE '🌱 Spróbuj jeszcze raz!'
    END;

    RETURN jsonb_build_object(
        'user_id',  v_user_id,
        'score',    v_score,
        'total',    v_total,
        'percent',  v_percent,
        'message',  v_message
    );
END;
$$;
GRANT EXECUTE ON FUNCTION submit_station_result(TEXT, TEXT, TEXT, INT, jsonb, TEXT) TO anon, authenticated;


-- ----- 4. get_top_performers - ranking (wymaga authenticated) -----
CREATE OR REPLACE FUNCTION get_top_performers(
    p_class_level TEXT DEFAULT NULL,
    p_percent     INT  DEFAULT 20,
    p_date_from   DATE DEFAULT NULL,
    p_date_to     DATE DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_total INT;
    v_top_count INT;
    v_results jsonb;
BEGIN
    SELECT COUNT(*) INTO v_total FROM (
        SELECT u.id
        FROM users u
        INNER JOIN results r ON r.user_id = u.id
        WHERE u.role = 'user'
          AND (p_class_level IS NULL OR u.class_level = p_class_level)
          AND (p_date_from IS NULL OR r.completed_at >= p_date_from::TIMESTAMP)
          AND (p_date_to   IS NULL OR r.completed_at <= (p_date_to + INTERVAL '1 day')::TIMESTAMP)
        GROUP BY u.id
    ) sub;

    v_top_count := GREATEST(1, CEIL(v_total::NUMERIC * p_percent / 100)::INT);

    SELECT jsonb_agg(row_to_json(t)) INTO v_results FROM (
        SELECT row_number() OVER (ORDER BY total_score DESC, last_played ASC) AS rank, *
        FROM (
            SELECT u.id AS user_id, u.first_name, u.last_name, u.class_level,
                   g.symbol AS group_symbol,
                   SUM(r.score)::INT AS total_score,
                   SUM(r.total)::INT AS max_score,
                   COUNT(DISTINCT r.station_id)::INT AS stations_done,
                   MAX(r.completed_at) AS last_played
            FROM users u
            LEFT  JOIN groups g ON g.id = u.group_id
            INNER JOIN results r ON r.user_id = u.id
            WHERE u.role = 'user'
              AND (p_class_level IS NULL OR u.class_level = p_class_level)
              AND (p_date_from IS NULL OR r.completed_at >= p_date_from::TIMESTAMP)
              AND (p_date_to   IS NULL OR r.completed_at <= (p_date_to + INTERVAL '1 day')::TIMESTAMP)
            GROUP BY u.id, g.symbol
            ORDER BY SUM(r.score) DESC, MAX(r.completed_at) ASC
            LIMIT v_top_count
        ) ranked
    ) t;

    RETURN jsonb_build_object(
        'total_students', v_total,
        'top_count',      v_top_count,
        'percent',        p_percent,
        'class_level',    p_class_level,
        'date_from',      p_date_from,
        'date_to',        p_date_to,
        'performers',     COALESCE(v_results, '[]'::jsonb)
    );
END;
$$;
GRANT EXECUTE ON FUNCTION get_top_performers(TEXT, INT, DATE, DATE) TO anon, authenticated;


-- ----- 5. verify_admin - login admina przez bcrypt -----
CREATE OR REPLACE FUNCTION verify_admin(p_login TEXT, p_password TEXT)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user RECORD;
BEGIN
    SELECT id, first_name, last_name, password_hash INTO v_user
    FROM users WHERE login = p_login AND role = 'admin' LIMIT 1;

    IF v_user.id IS NULL OR v_user.password_hash IS NULL THEN
        RETURN jsonb_build_object('ok', false);
    END IF;

    IF crypt(p_password, v_user.password_hash) <> v_user.password_hash THEN
        RETURN jsonb_build_object('ok', false);
    END IF;

    RETURN jsonb_build_object(
        'ok',         true,
        'user_id',    v_user.id,
        'first_name', v_user.first_name,
        'last_name',  v_user.last_name
    );
END;
$$;
GRANT EXECUTE ON FUNCTION verify_admin(TEXT, TEXT) TO anon, authenticated;


-- ----- 6. get_all_results - lista wyników (admin) -----
CREATE OR REPLACE FUNCTION get_all_results(p_limit INT DEFAULT 500)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN jsonb_build_object(
        'results',
        COALESCE((
            SELECT jsonb_agg(t) FROM (
                SELECT r.id, r.score, r.total, r.completed_at, r.station_id,
                       s.name AS station_name, s.icon AS station_icon,
                       u.id AS user_id, u.first_name, u.last_name, u.class_level,
                       g.symbol AS group_symbol
                FROM results r
                JOIN users u ON u.id = r.user_id
                LEFT JOIN groups g ON g.id = u.group_id
                LEFT JOIN stations s ON s.id = r.station_id
                ORDER BY r.completed_at DESC
                LIMIT p_limit
            ) t
        ), '[]'::jsonb),
        'count', (SELECT COUNT(*) FROM results)
    );
END;
$$;
GRANT EXECUTE ON FUNCTION get_all_results(INT) TO anon, authenticated;


-- ----- 7. delete_result, delete_all_results (admin) -----
CREATE OR REPLACE FUNCTION delete_result(p_id INT)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count INT;
BEGIN
    DELETE FROM results WHERE id = p_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN jsonb_build_object('deleted', v_count > 0, 'id', p_id);
END;
$$;
GRANT EXECUTE ON FUNCTION delete_result(INT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION delete_all_results()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    DELETE FROM results;
    RETURN jsonb_build_object('truncated', true);
END;
$$;
GRANT EXECUTE ON FUNCTION delete_all_results() TO anon, authenticated;


-- ----- 8. get_groups - publiczny zwrot listy grup z liczbą członków -----
CREATE OR REPLACE FUNCTION get_groups()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN jsonb_build_object(
        'groups',
        COALESCE((
            SELECT jsonb_agg(t ORDER BY t.symbol) FROM (
                SELECT g.id, g.symbol, g.name, g.icon,
                       (SELECT COUNT(*)::INT FROM users u WHERE u.group_id = g.id AND u.role='user') AS members
                FROM groups g
            ) t
        ), '[]'::jsonb)
    );
END;
$$;
GRANT EXECUTE ON FUNCTION get_groups() TO anon, authenticated;


-- =====================================================================
--  ROW LEVEL SECURITY (RLS)
-- =====================================================================

ALTER TABLE groups    ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE results   ENABLE ROW LEVEL SECURITY;

-- Publiczny odczyt: stations (groups dostępne też przez get_groups RPC)
CREATE POLICY "anon_read_stations" ON stations FOR SELECT TO anon, authenticated USING (true);

-- Wszystko inne (questions/answers/users/results/groups) - dostęp TYLKO przez RPC
-- Brak policy = brak bezpośredniego dostępu z anon key.
