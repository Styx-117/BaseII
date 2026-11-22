const readline = require('readline');
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Ejecuta este comando en una terminal interactiva.');
  }
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  const preguntar = texto => new Promise(resolve => terminal.question(texto, resolve));
  try {
    const nombre = (await preguntar('Nombre del administrador: ')).trim();
    const email = (await preguntar('Correo: ')).trim().toLowerCase();
    if (!nombre || nombre.length > 255 || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Ingresa un nombre y correo válidos.');
    }
    terminal.stdoutMuted = true;
    terminal._writeToOutput = function (value) {
      if (!this.stdoutMuted) this.output.write(value);
    };
    process.stdout.write('Contraseña (mínimo 12 caracteres): ');
    const password = await preguntar('');
    process.stdout.write('\nConfirma la contraseña: ');
    const confirmacion = await preguntar('');
    process.stdout.write('\n');
    if (password.length < 12 || Buffer.byteLength(password) > 72 || password !== confirmacion) {
      throw new Error('Las contraseñas deben coincidir y tener entre 12 caracteres y 72 bytes.');
    }
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO usuarios(nombre_completo, email, password_hash, rol) VALUES ($1, $2, $3, $4)',
      [nombre, email, hash, 'ADMIN']
    );
    console.log('Administrador creado:', email);
  } finally {
    terminal.close();
    await pool.end();
  }
}

main().catch(error => {
  console.error(error.code === '23505' ? 'Ya existe una cuenta con ese correo.' : error.message);
  process.exitCode = 1;
});
