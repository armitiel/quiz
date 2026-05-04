// JWT helpers + middleware autoryzacji
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'devsecret_zmien_na_produkcji';

export function signToken(payload, expiresIn = '24h') {
  return jwt.sign(payload, SECRET, { expiresIn, issuer: 'lesny-quiz' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET, { issuer: 'lesny-quiz' });
  } catch {
    return null;
  }
}

/** Wyciąga claims z nagłówka Authorization. Zwraca null gdy brak/nieważny. */
export function getClaims(req) {
  const auth = req.headers.authorization || req.headers.Authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  return verifyToken(m[1]);
}

/** Wymaga zalogowanego usera. Wywołuje res.json() z 401 i zwraca null jeśli brak. */
export function requireAuth(req, res) {
  const c = getClaims(req);
  if (!c) {
    res.status(401).json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Brak autoryzacji' } });
    return null;
  }
  return c;
}

/** Wymaga rolą admin. */
export function requireAdmin(req, res) {
  const c = requireAuth(req, res);
  if (!c) return null;
  if (c.role !== 'admin') {
    res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'Brak uprawnień admina' } });
    return null;
  }
  return c;
}
