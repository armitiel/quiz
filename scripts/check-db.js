// Test polaczenia z Neon Postgres + sprawdzenie czy schema jest zaladowana.
// Uruchomienie: node scripts/check-db.js
import { Pool } from 'pg';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log('🔌 Łączę się z Neon...');
  const c = await pool.connect();

  try {
    const v = await c.query('SELECT version()');
    console.log('✓', v.rows[0].version.split(',')[0]);

    const tables = await c.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname='public' ORDER BY tablename
    `);
    console.log('\n📊 Tabele w bazie:', tables.rows.map((r) => r.tablename).join(', ') || '(brak)');

    if (tables.rows.length === 0) {
      console.log('\n⚠️  Baza jest PUSTA - wykonaj scripts/setup-db.js żeby załadować schema');
      return;
    }

    const counts = await c.query(`
      SELECT
        (SELECT COUNT(*) FROM users)     AS users,
        (SELECT COUNT(*) FROM groups)    AS groups,
        (SELECT COUNT(*) FROM stations)  AS stations,
        (SELECT COUNT(*) FROM questions) AS questions,
        (SELECT COUNT(*) FROM answers)   AS answers,
        (SELECT COUNT(*) FROM results)   AS results
    `);
    console.log('\n📈 Liczba rekordów:');
    Object.entries(counts.rows[0]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

    const fns = await c.query(`
      SELECT proname FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND proname IN
        ('check_user_exists','get_station_questions','submit_station_result',
         'verify_admin','get_top_performers','get_all_results','get_groups',
         'delete_result','delete_all_results')
      ORDER BY proname
    `);
    console.log('\n⚙️  Funkcje RPC:', fns.rows.map((r) => r.proname).join(', ') || '(brak)');

  } finally {
    c.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error('✗ BŁĄD:', e.message);
  process.exit(1);
});
