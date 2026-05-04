// GET /api/leaderboard
// Publiczny ranking - top 20 użytkowników po sumie najlepszych wyników z każdej stacji.
// Bez autoryzacji - każdy widzi tablicę liderów po ukończeniu quizu.
import { query } from './_lib/db.js';
import { ok, fail, wrap } from './_lib/response.js';

const SQL = `
  WITH best_per_station AS (
    SELECT DISTINCT ON (r.user_id, r.station_id)
      r.user_id, r.station_id, r.score, r.total, r.completed_at
    FROM results r
    ORDER BY r.user_id, r.station_id, r.score DESC, r.completed_at ASC
  ),
  agg AS (
    SELECT u.id,
           u.first_name,
           u.last_name,
           u.class_level,
           SUM(b.score)::INT AS best_score,
           SUM(b.total)::INT AS total,
           (SELECT COUNT(*)::INT FROM results r2 WHERE r2.user_id = u.id) AS attempts,
           MAX(b.completed_at) AS last_played
    FROM users u
    INNER JOIN best_per_station b ON b.user_id = u.id
    WHERE u.role = 'user'
    GROUP BY u.id, u.first_name, u.last_name, u.class_level
  )
  SELECT first_name, last_name, class_level, attempts, best_score, total
  FROM agg
  ORDER BY best_score DESC, last_played ASC
  LIMIT 20
`;

export default wrap(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'METHOD_NOT_ALLOWED', 'Tylko GET');
  const { rows } = await query(SQL);
  return ok(res, { leaderboard: rows });
});
