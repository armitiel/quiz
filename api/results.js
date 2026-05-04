// /api/results
//   POST   - dziecko zapisuje wynik (z lazy create przez submit_station_result)
//   GET    - admin pobiera wszystkie
//   DELETE - admin usuwa: ?id=X (pojedynczy) lub bez params (wszystkie)
import { rpc } from './_lib/db.js';
import { requireAuth, requireAdmin } from './_lib/auth.js';
import { ok, created, fail, wrap } from './_lib/response.js';

export default wrap(async (req, res) => {
  if (req.method === 'POST') {
    const claims = requireAuth(req, res);
    if (!claims) return;

    const { station_id, answers } = req.body || {};
    if (!station_id || !Array.isArray(answers) || answers.length === 0) {
      return fail(res, 400, 'BAD_REQUEST', 'Wymagane: station_id, answers[]');
    }

    // Dane usera z tokena (pending = nowy, sub = istniejący)
    const fn = claims.pending?.first_name  || claims.name?.split(' ')[0];
    const ln = claims.pending?.last_name   || claims.name?.split(' ').slice(1).join(' ');
    const cl = claims.pending?.class_level || claims.class_level;
    const gs = claims.pending?.group_symbol || null;

    if (!fn || !ln) return fail(res, 400, 'BAD_REQUEST', 'Brak imienia/nazwiska w tokenie');

    const data = await rpc('submit_station_result', [
      fn, ln, cl, station_id, JSON.stringify(answers), gs,
    ]);
    return created(res, data);
  }

  if (req.method === 'GET') {
    if (!requireAdmin(req, res)) return;
    const data = await rpc('get_all_results', [500]);
    return ok(res, data);
  }

  if (req.method === 'DELETE') {
    if (!requireAdmin(req, res)) return;
    // ?ids=1,2,3,4 - cała sesja jednym wywołaniem
    if (req.query.ids) {
      const ids = String(req.query.ids)
        .split(',')
        .map((x) => parseInt(x.trim(), 10))
        .filter((n) => Number.isInteger(n) && n > 0);
      if (ids.length === 0) return fail(res, 400, 'BAD_REQUEST', 'Brak prawidłowych id');
      const data = await rpc('delete_results', [ids]);
      return ok(res, data);
    }
    // ?id=X - pojedynczy wynik (kompatybilność wsteczna)
    const id = req.query.id ? parseInt(req.query.id, 10) : null;
    if (id) {
      const data = await rpc('delete_result', [id]);
      return ok(res, data);
    }
    const data = await rpc('delete_all_results', []);
    return ok(res, { ...data, message: 'Wszystkie wyniki usunięte' });
  }

  return fail(res, 405, 'METHOD_NOT_ALLOWED', 'Dozwolone: POST, GET, DELETE');
});
