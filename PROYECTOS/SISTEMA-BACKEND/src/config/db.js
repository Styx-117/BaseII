const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error adquiriendo el cliente de la base de datos:', err.stack);
  }
  console.log('Conexión exitosa a PostgreSQL en AWS RDS');
  release();
});

module.exports = pool;