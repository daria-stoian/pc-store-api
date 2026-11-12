// Creează baza de date (dacă nu există) și tabelele din db/schema.sql.  Rulare: npm run db:init
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const config = require('../src/config/env');

(async () => {
  const { database, ...conn } = config.db;
  if (!/^[A-Za-z0-9_]+$/.test(database)) throw new Error('DB_NAME invalid (doar litere, cifre, _)');

  // 1) Ne conectăm la baza implicită "postgres" ca să creăm baza proiectului
  const admin = new Client({ ...conn, database: 'postgres' });
  await admin.connect();
  try {
    const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [database]);
    if (!exists.rowCount) await admin.query(`CREATE DATABASE "${database}"`);
  } finally {
    await admin.end();
  }

  // 2) Rulăm schema în baza proiectului
  const client = new Client({ ...conn, database });
  await client.connect();
  try {
    await client.query(fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8'));
    console.log(`Baza de date '${database}' este pregătită (tabele create).`);
  } finally {
    await client.end();
  }
})().catch((err) => {
  console.error('init-db a eșuat:', err.message || err.code || err);
  if (err.code === 'ECONNREFUSED') console.error('-> PostgreSQL nu rulează sau portul din .env (DB_PORT) e greșit. Pornește serviciul PostgreSQL (Services -> postgresql-x64-..).');
  if (err.code === '28P01') console.error('-> Parola din .env (DB_PASSWORD) este greșită pentru utilizatorul PostgreSQL. Rulează: npm run setup -- --force');
  if (err.code === '28000') console.error('-> Utilizatorul din .env (DB_USER) nu există în PostgreSQL.');
  process.exit(1);
});
