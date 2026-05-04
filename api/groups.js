// GET /api/groups - publiczna lista grup
import { rpc } from './_lib/db.js';
import { ok, fail, wrap } from './_lib/response.js';

export default wrap(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'METHOD_NOT_ALLOWED', 'Tylko GET');
  const data = await rpc('get_groups', []);
  return ok(res, { ...data, count: data?.groups?.length || 0 });
});
