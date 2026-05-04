// GET /api/stations - lista 4 stacji (publiczne)
import { query } from './_lib/db.js';
import { ok, fail, wrap } from './_lib/response.js';

export default wrap(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'METHOD_NOT_ALLOWED', 'Tylko GET');

  const r = await query(
    'SELECT id, slug, name, subtitle, icon, order_no FROM stations ORDER BY order_no'
  );
  return ok(res, {
    stations: r.rows.map((s) => ({ ...s, order: s.order_no })),
    count:    r.rows.length,
  });
});
