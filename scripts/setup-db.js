// Wykonuje schema.sql + functions_and_rls.sql w bazie Neon.
// Uruchomienie: node scripts/setup-db.js
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runFile(client, filePath, label) {
  console.log(`\n📄 Wykonuję ${label}...`);
  const sql = readFileSync(filePath, 'utf-8');
  // Neon nie ma problemu z multi-statement query
  await client.query(sql);
  console.log(`   ✓ ${label} OK`);
}

async function main() {
  console.log('🔌 Łączę się z Neon...');
  const c = await pool.connect();

  try {
    await runFile(c, join(__dirname, '..', 'supabase', 'schema.sql'), 'schema.sql');
    await runFile(c, join(__dirname, '..', 'supabase', 'functions_neon.sql'), 'functions_neon.sql');

    const counts = await c.query(`
      SELECT
        (SELECT COUNT(*) FROM users)     AS users,
        (SELECT COUNT(*) FROM groups)    AS groups,
        (SELECT COUNT(*) FROM stations)  AS stations,
        (SELECT COUNT(*) FROM questions) AS questions,
        (SELECT COUNT(*) FROM answers)   AS answers
    `);
    console.log('\n📈 Zaimportowano:');
    Object.entries(counts.rows[0]).forEach(([k, v]) => console.log(`   ${k}: ${v}`));

    console.log('\n✅ Baza gotowa!');
  } finally {
    c.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error('\n✗ BŁĄD:', e.message);
  process.exit(1);
});
