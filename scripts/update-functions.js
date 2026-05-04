// Wykonuje TYLKO functions_neon.sql (bez resetu schematu/danych).
// Uruchomienie: node scripts/update-functions.js
import { Pool } from 'pg';
import { readFileSync } from 'fs';
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
    const path = join(__dirname, '..', 'supabase', 'functions_neon.sql');
    console.log(`📄 Wykonuję ${path}...`);
    const sql = readFileSync(path, 'utf-8');
    await c.query(sql);
    console.log('   ✓ functions_neon.sql OK');
    console.log('\n✅ Funkcje RPC zaktualizowane!');
  } finally {
    c.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error('\n✗ BŁĄD:', e.message);
  process.exit(1);
});
