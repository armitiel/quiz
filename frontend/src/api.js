/**
 * API client - cienka warstwa nad Vercel Serverless Functions.
 * Format odpowiedzi: { ok, data, error } - identyczny jak stary PHP backend.
 */

const API_BASE = '/api';
const TOKEN_KEY = 'lesny_quiz_token';
const USER_KEY  = 'lesny_quiz_user';

// === SESJA (sessionStorage żeby auto-czyściło się po zamknięciu karty) ===
export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}
export function setSession(token, user) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY,  JSON.stringify(user));
}
export function getUser() {
  const raw = sessionStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

// === HELPER ===
class ApiError extends Error {
  constructor(code, message, status, details) {
    super(message);
    this.code = code; this.status = status; this.details = details;
  }
}

async function request(path, { method = 'GET', body = null, requireAuth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (requireAuth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  let resp;
  try {
    resp = await fetch(`${API_BASE}${path}`, {
      method, headers, body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError('NETWORK_ERROR', 'Brak połączenia z serwerem', 0);
  }

  let json;
  try { json = await resp.json(); }
  catch { throw new ApiError('PARSE_ERROR', 'Zła odpowiedź serwera', resp.status); }

  if (!resp.ok || json.ok === false) {
    const err = json.error || {};
    if (resp.status === 401 && getToken()) clearSession();
    throw new ApiError(err.code || 'UNKNOWN', err.message || 'Błąd', resp.status, err.details);
  }
  return json.data;
}

// === API ===
export const api = {

  loginUser: async (firstName, lastName, groupSymbol = '', classLevel = '') => {
    const data = await request('/login', {
      method: 'POST',
      body: {
        first_name: firstName,
        last_name:  lastName,
        ...(groupSymbol ? { group_symbol: groupSymbol } : {}),
        ...(classLevel  ? { class_level:  classLevel  } : {}),
      },
      requireAuth: false,
    });
    setSession(data.token, data.user);
    return data;
  },

  loginAdmin: async (login, password) => {
    const data = await request('/login', {
      method: 'POST',
      body: { login, password },
      requireAuth: false,
    });
    setSession(data.token, data.user);
    return data;
  },

  logout: () => clearSession(),

  checkUser: (firstName, lastName) => {
    const params = new URLSearchParams({ first_name: firstName, last_name: lastName });
    return request(`/check-user?${params}`, { requireAuth: false });
  },

  getStations: () => request('/stations', { requireAuth: false }),

  getStationQuestions: (stationId) => request(`/stations/${stationId}/questions`),

  submitStationResults: (stationId, answers) => request('/results', {
    method: 'POST',
    body: { station_id: stationId, answers },
  }),

  getGroups: () => request('/groups', { requireAuth: false }),

  getAllResults: () => request('/results'),
  resetResults:  () => request('/results', { method: 'DELETE' }),
  deleteResult:  (id) => request(`/results?id=${id}`, { method: 'DELETE' }),

  getTopPerformers: ({ classLevel = null, percent = 20, dateFrom = null, dateTo = null } = {}) => {
    const params = new URLSearchParams();
    if (classLevel) params.set('class_level', classLevel);
    if (dateFrom)   params.set('date_from', dateFrom);
    if (dateTo)     params.set('date_to', dateTo);
    params.set('percent', percent);
    return request(`/top-performers?${params}`);
  },

  /**
   * Eksport Excel - generujemy lokalnie po pobraniu danych przez SheetJS (CDN).
   */
  downloadExport: async ({ classLevel = null, dateFrom = null, dateTo = null } = {}) => {
    const all = await api.getAllResults();
    let rows = all.results || [];
    if (classLevel) rows = rows.filter((r) => r.class_level === classLevel);
    if (dateFrom)   rows = rows.filter((r) => r.completed_at >= dateFrom + 'T00:00:00');
    if (dateTo)     rows = rows.filter((r) => r.completed_at <= dateTo + 'T23:59:59');

    if (!window.XLSX) {
      await loadScript('https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js');
    }
    const XLSX = window.XLSX;
    const data = [
      ['Data', 'Godzina', 'Imię', 'Nazwisko', 'Klasa', 'Grupa', 'Stacja', 'Wynik', 'Maksymalnie', 'Procent'],
      ...rows.map((r) => {
        const dt = (r.completed_at || '').split('T');
        const time = (dt[1] || '').slice(0, 8);
        const pct = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
        return [
          dt[0] || '', time,
          r.first_name, r.last_name,
          r.class_level || '', r.group_symbol || '',
          (r.station_icon ? r.station_icon + ' ' : '') + (r.station_name || 'Brak stacji'),
          r.score, r.total, pct + '%',
        ];
      }),
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 8 },
      { wch: 14 }, { wch: 28 }, { wch: 8 }, { wch: 13 }, { wch: 9 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Wyniki');
    XLSX.writeFile(wb, `lesny-quiz-wyniki_${new Date().toISOString().slice(0, 10)}.xlsx`);
  },
};

export { ApiError };

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = resolve;
    s.onerror = () => reject(new Error('Nie udało się załadować ' + src));
    document.head.appendChild(s);
  });
}
