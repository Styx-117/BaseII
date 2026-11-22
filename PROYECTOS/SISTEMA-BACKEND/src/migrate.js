const fs = require('fs');
const path = require('path');
const pool = require('./config/db');
async function main() {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock(184311)');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())');
    const dir = path.join(__dirname, '../../SQL/migrations');
    for (const name of fs.readdirSync(dir).filter(n => n.endsWith('.sql')).sort()) {
      const exists = await client.query('SELECT 1 FROM schema_migrations WHERE name=$1', [name]);
      if (exists.rowCount) continue;
      await client.query('BEGIN');
      try {
        await client.query(fs.readFileSync(path.join(dir, name), 'utf8'));
        await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [name]);
        await client.query('COMMIT');
        console.log(`Migración aplicada: ${name}`);
      } catch (err) { await client.query('ROLLBACK'); throw err; }
    }
  } finally { await client.query('SELECT pg_advisory_unlock(184311)'); client.release(); }
}
module.exports = main;

if (require.main === module) {
  main().catch(error => {
    console.error('No se pudo inicializar la base:', error.message);
    process.exitCode = 1;
  }).finally(() => pool.end());
}
