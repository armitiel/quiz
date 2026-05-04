import { query, getPool } from '../api/_lib/db.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

async function main() {
  await query(`UPDATE users SET password_hash = crypt('admin123', gen_salt('bf', 12)) WHERE login = 'admin'`);
  console.log('✓ Hash admina zregenerowany przez pgcrypto');

  const r = await query(`SELECT crypt('admin123', password_hash) = password_hash AS ok FROM users WHERE login = 'admin'`);
  console.log('  Test bcrypt OK:', r.rows[0].ok);

  await getPool().end();
}
main().catch(e => { console.error(e); process.exit(1); });
