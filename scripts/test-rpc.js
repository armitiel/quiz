// Quick test wszystkich RPC functions w Neon
import { rpc, query, getPool } from '../api/_lib/db.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

async function main() {
  console.log('=== Test 1: stations (raw query) ===');
  const r1 = await query('SELECT id, name FROM stations ORDER BY id');
  console.log(`  ${r1.rows.length} stacji`);

  console.log('\n=== Test 2: get_groups ===');
  const r2 = await rpc('get_groups', []);
  console.log(`  ${r2.groups.length} grup`);

  console.log('\n=== Test 3: get_station_questions(2, "1-3") ===');
  const r3 = await rpc('get_station_questions', [2, '1-3']);
  console.log(`  Stacja: ${r3.station.name}, pytań: ${r3.total}`);

  console.log('\n=== Test 4: verify_admin admin/admin123 ===');
  const r4 = await rpc('verify_admin', ['admin', 'admin123']);
  console.log(' ', r4);

  console.log('\n=== Test 5: submit_station_result ===');
  const answers = r3.questions.map((q) => ({
    question_id: q.id,
    answer_id:   q.answers.find((a) => a.is_correct).id,
  }));
  const r5 = await rpc('submit_station_result',
    ['Test', 'Deploy', '1-3', 2, JSON.stringify(answers), 'LISKI']);
  console.log(' ', r5);

  console.log('\n=== Test 6: get_top_performers ===');
  const r6 = await rpc('get_top_performers', ['1-3', 100, null, null]);
  console.log(`  ${r6.total_students} uczniów, top ${r6.top_count}`);
  if (r6.performers?.length) {
    console.log(`  Najlepszy: ${r6.performers[0].first_name} ${r6.performers[0].last_name} = ${r6.performers[0].total_score}`);
  }

  // Cleanup
  await query("DELETE FROM users WHERE first_name = 'Test' AND last_name = 'Deploy'");
  console.log('\n✅ Wszystkie RPC działają. Cleanup OK.');
  await getPool().end();
}

main().catch((e) => { console.error('✗', e.message); process.exit(1); });
