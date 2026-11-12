const config = require('./config/env');

if (!config.jwt.secret || config.jwt.secret.length < 16) {
  console.error('JWT_SECRET lipsește sau e prea scurt (minim 16 caractere). Completează-l în fișierul .env.');
  process.exit(1);
}

const app = require('./app');
const db = require('./db');

const server = app.listen(config.port, async () => {
  console.log(`API pornit pe http://localhost:${config.port}`);
  console.log(`Swagger UI:  http://localhost:${config.port}/api-docs`);
  try {
    await db.query('SELECT 1');
    console.log('Conexiune PostgreSQL OK');
  } catch (err) {
    console.error('Nu mă pot conecta la PostgreSQL:', err.message);
  }
});

const shutdown = () => server.close(() => db.pool.end().then(() => process.exit(0)));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
