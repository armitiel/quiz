// Standardowe odpowiedzi JSON - identyczny format jak stary PHP backend.

export function ok(res, data) {
  return res.status(200).json({ ok: true, data, error: null });
}

export function created(res, data) {
  return res.status(201).json({ ok: true, data, error: null });
}

export function fail(res, status, code, message, details = null) {
  return res.status(status).json({
    ok: false, data: null,
    error: { code, message, ...(details ? { details } : {}) },
  });
}

/** Wrap funkcji handler żeby łapać exception i zwrócić 500 JSON zamiast crash. */
export function wrap(handler) {
  return async (req, res) => {
    try {
      // CORS - dla deploy gdzie frontend i api są na tym samym hoście, ale na wszelki wypadek
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') return res.status(204).end();

      await handler(req, res);
    } catch (err) {
      console.error('[API ERROR]', err);
      if (!res.headersSent) {
        fail(res, 500, 'INTERNAL_ERROR', err.message || 'Błąd serwera');
      }
    }
  };
}
