// GET /api/top-performers?class_level=1-3&percent=20&date_from=2026-01-01&date_to=2026-12-31
// Tylko admin
import { rpc } from './_lib/db.js';
import { requireAdmin } from './_lib/auth.js';
import { ok, fail, wrap } from './_lib/response.js';

export default wrap(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'METHOD_NOT_ALLOWED', 'Tylko GET');
  if (!requireAdmin(req, res)) return;

  const cl       = req.query.class_level || null;
  const pct      = parseInt(req.query.percent, 10) || 20;
  const dateFrom = req.query.date_from || null;
  const dateTo   = req.query.date_to   || null;

  const data = await rpc('get_top_performers', [cl, pct, dateFrom, dateTo]);
  return ok(res, data);
});
