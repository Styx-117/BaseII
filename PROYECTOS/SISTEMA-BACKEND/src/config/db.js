const { Pool } = require('pg');
require('dotenv').config();
const options = process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {
  user: process.env.DB_USER, password: process.env.DB_PASSWORD, host: process.env.DB_HOST,
  port: process.env.DB_PORT, database: process.env.DB_DATABASE
};
const url = options.connectionString ? new URL(options.connectionString) : null;
const host = url?.hostname || options.host || process.env.PGHOST || '';
const onRender = process.env.RENDER === 'true';
const renderExternal = host.endsWith('-postgres.render.com');
const renderInternal = onRender && /^dpg-[a-z0-9-]+$/i.test(host);

if (onRender || renderExternal || process.env.PGSSL === 'true') {
  // pg gives URL parameters precedence over pool options.
  if (url) {
    if (url.searchParams.get('sslmode') === 'disable') url.searchParams.delete('sslmode');
    if (url.searchParams.get('ssl') === 'false' || url.searchParams.get('ssl') === '0') url.searchParams.delete('ssl');
    options.connectionString = url.toString();
  }
  options.ssl = { minVersion: 'TLSv1.2', rejectUnauthorized: !renderInternal };
}

module.exports = new Pool(options);
