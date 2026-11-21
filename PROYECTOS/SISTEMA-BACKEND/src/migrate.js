const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
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
    await client.query('BEGIN');
    try {
      const users = [['ADMIN','Administrador','admin@icamarket.local'], ['CAJERO','Cajero','cajero@icamarket.local'], ['ALMACENERO','Almacenero','almacen@icamarket.local']];
      for (const [role, name, email] of users) {
        const initialized = await client.query('SELECT 1 FROM cuentas_iniciales WHERE rol=$1', [role]);
        if (initialized.rowCount) continue;
        const existing = await client.query('SELECT id FROM usuarios WHERE lower(trim(email))=$1', [email]);
        if (!existing.rowCount) {
          const password = process.env[`INITIAL_${role}_PASSWORD`];
          if (!password || password.length < 12) throw new Error(`Configure INITIAL_${role}_PASSWORD con al menos 12 caracteres para crear ${email}`);
          await client.query('INSERT INTO usuarios(nombre_completo,email,password_hash,rol) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO NOTHING', [name,email,await bcrypt.hash(password,12),role]);
        }
        await client.query('INSERT INTO cuentas_iniciales(rol) VALUES ($1)', [role]);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally { await client.query('SELECT pg_advisory_unlock(184311)'); client.release(); await pool.end(); }
}
main().catch(err => { console.error('No se pudo inicializar la base:', err.message); process.exitCode=1; });
