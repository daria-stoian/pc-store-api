// Creează fișierul .env interactiv (cere doar parola PostgreSQL, generează singur JWT_SECRET).
// Rulare: npm run setup   (sau automat din start.bat). Cu --force rescrie un .env existent.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const envPath = path.join(__dirname, '..', '.env');
const force = process.argv.includes('--force');

if (fs.existsSync(envPath) && !force) {
  console.log('.env există deja — nu îl modific (folosește --force ca să-l rescrii).');
  process.exit(0);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
// Coadă de linii: funcționează și când intrarea e redirecționată (nu pierde linii).
const lines = [];
let waiting = null;
rl.on('line', (l) => (waiting ? waiting(l) : lines.push(l)));
const ask = (q, def) => new Promise((resolve) => {
  process.stdout.write(def ? `${q} [${def}]: ` : `${q}: `);
  const done = (a) => { waiting = null; resolve(a.trim() || def || ''); };
  if (lines.length) done(lines.shift()); else waiting = done;
});

(async () => {
  console.log('Configurare conexiune PostgreSQL (apasă Enter pentru valoarea din paranteze)\n');
  const port = await ask('Port PostgreSQL', '5432');
  const user = await ask('Utilizator', 'postgres');
  const password = await ask('Parola PostgreSQL (cea setată la instalare)');
  rl.close();

  const env = [
    'PORT=3000',
    '',
    'DB_HOST=localhost',
    `DB_PORT=${port}`,
    `DB_USER=${user}`,
    `DB_PASSWORD=${password}`,
    'DB_NAME=pc_store',
    '',
    `JWT_SECRET=${crypto.randomBytes(48).toString('hex')}`,
    'JWT_EXPIRES_IN=1h',
    '',
    'ADMIN_EMAIL=admin@pcstore.ro',
    'ADMIN_PASSWORD=Admin123!',
    '',
  ].join('\n');
  fs.writeFileSync(envPath, env);
  console.log('\nAm creat fișierul .env');
})();
