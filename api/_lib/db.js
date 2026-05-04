// Wspólny pool połączeń do Neon Postgres dla wszystkich Vercel Functions.
// W serverless: pool reusowany między cold starts (jeśli kontener jest cieply).
import { Pool } from 'pg';

let pool;

export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('Brak DATABASE_URL w env');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Neon obsługuje SSL automatycznie z connectionString
      max: 5,                      // małe limity dla serverless (zwykle 1-3 zapytania na request)
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

/** Wywołanie funkcji RPC w Postgres - zwraca jsonb */
export async function rpc(name, args = []) {
  const placeholders = args.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `SELECT ${name}(${placeholders}) AS result`;
  const { rows } = await getPool().query(sql, args);
  return rows[0]?.result ?? null;
}

/** Zwykłe SQL query */
export async function query(sql, params = []) {
  return getPool().query(sql, params);
}
