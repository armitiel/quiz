// GET /api/check-user?first_name=X&last_name=Y - czy uczeń istnieje + jego grupa
import { rpc } from './_lib/db.js';
import { ok, fail, wrap } from './_lib/response.js';

export default wrap(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'METHOD_NOT_ALLOWED', 'Tylko GET');

  const fn = (req.query.first_name || '').trim();
  const ln = (req.query.last_name  || '').trim();
  if (!fn || !ln) return ok(res, { exists: false });

  const data = await rpc('check_user_exists', [fn, ln]);
  return ok(res, data);
});
