// POST /api/login
//   Dziecko:    { first_name, last_name, class_level, group_symbol? }
//   Admin:      { login, password }
import { rpc } from './_lib/db.js';
import { signToken } from './_lib/auth.js';
import { ok, fail, wrap } from './_lib/response.js';

export default wrap(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'METHOD_NOT_ALLOWED', 'Tylko POST');

  const body = req.body || {};

  // === Tryb admin ===
  if (body.login) {
    const result = await rpc('verify_admin', [body.login, body.password || '']);
    if (!result?.ok) return fail(res, 401, 'AUTH_FAILED', 'Nieprawidłowy login lub hasło');

    const token = signToken({
      sub:  result.user_id,
      role: 'admin',
      name: `${result.first_name} ${result.last_name}`,
    });

    return ok(res, {
      token,
      user: {
        id:         result.user_id,
        first_name: result.first_name,
        last_name:  result.last_name,
        role:       'admin',
      },
    });
  }

  // === Tryb dziecka - LAZY (token bez zapisu w bazie) ===
  const firstName  = (body.first_name  || '').trim();
  const lastName   = (body.last_name   || '').trim();
  const classLevel = body.class_level || null;
  const groupSym   = body.group_symbol || null;

  if (!firstName || !lastName) return fail(res, 400, 'BAD_REQUEST', 'Wymagane: first_name, last_name');
  if (classLevel && !['1-3', '4-6'].includes(classLevel)) {
    return fail(res, 400, 'BAD_REQUEST', "class_level musi być '1-3' lub '4-6'");
  }

  const token = signToken({
    sub:          null,
    role:         'user',
    name:         `${firstName} ${lastName}`,
    class_level:  classLevel,
    pending: { first_name: firstName, last_name: lastName, group_symbol: groupSym, class_level: classLevel },
  });

  return ok(res, {
    token,
    user: {
      id:           null,
      first_name:   firstName,
      last_name:    lastName,
      role:         'user',
      class_level:  classLevel,
      group:        groupSym ? { symbol: groupSym } : null,
    },
  });
});
