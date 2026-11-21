const { Pool } = require('pg');
require('dotenv').config();
const options = process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {
  user: process.env.DB_USER, password: process.env.DB_PASSWORD, host: process.env.DB_HOST,
  port: process.env.DB_PORT, database: process.env.DB_DATABASE
};
if (process.env.PGSSL === 'true') options.ssl = { rejectUnauthorized: false };
module.exports = new Pool(options);
