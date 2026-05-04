// GET /api/stations/{id}/questions - 3 losowe pytania ze stacji + klasa z tokena
import { rpc } from '../../_lib/db.js';
import { requireAuth } from '../../_lib/auth.js';
import { ok, fail, wrap } from '../../_lib/response.js';

export default wrap(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'METHOD_NOT_ALLOWED', 'Tylko GET');

  const claims = requireAuth(req, res);
  if (!claims) return;

  const stationId = parseInt(req.query.id, 10);
  if (!stationId) return fail(res, 400, 'BAD_REQUEST', 'Nieprawidłowe ID stacji');

  // Klasa z tokena (lub fallback - tryb dziecka)
  const classLevel = claims.class_level || claims.pending?.class_level;
  if (!classLevel || !['1-3', '4-6'].includes(classLevel)) {
    return fail(res, 400, 'NO_CLASS', 'Brak class_level w tokenie');
  }

  const data = await rpc('get_station_questions', [stationId, classLevel]);
  return ok(res, data);
});
