// Populează baza de date: admin + utilizator demo, categorii, furnizori, metode de livrare, produse.
// Sigur de rulat de mai multe ori (nu dublează date; produsele se inserează doar dacă tabela e goală).
// Rulare: npm run db:seed
const bcrypt = require('bcryptjs');
const config = require('../src/config/env');
const db = require('../src/db');
const data = require('./seedData');

const DEMO_USER = { email: 'user@pcstore.ro', password: 'User1234!', name: 'Utilizator Demo' };

async function ensureUser({ email, password, name }, role) {
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.length) return;
  const hash = await bcrypt.hash(password, 10);
  await db.query('INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)', [email, hash, name, role]);
  console.log(`  cont ${role} creat: ${email}`);
}

// Returnează id-ul rândului cu numele dat; îl inserează dacă lipsește
async function ensureByName(table, row) {
  const found = await db.query(`SELECT id FROM ${table} WHERE name = $1`, [row.name]);
  if (found.length) return found[0].id;
  const cols = Object.keys(row);
  const res = await db.query(
    `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
    cols.map((c) => row[c])
  );
  return res[0].id;
}

(async () => {
  await ensureUser({ email: config.admin.email, password: config.admin.password, name: 'Administrator' }, 'ADMIN');
  await ensureUser(DEMO_USER, 'USER');

  const supplierIds = [];
  for (const s of data.suppliers) supplierIds.push(await ensureByName('suppliers', s));
  const deliveryIds = [];
  for (const d of data.deliveryMethods) deliveryIds.push(await ensureByName('delivery_methods', d));

  const [{ n }] = await db.query('SELECT COUNT(*)::int AS n FROM products');
  let created = 0;
  let i = 0;
  for (const cat of data.categories) {
    const categoryId = await ensureByName('categories', { name: cat.name, description: cat.description });
    if (n > 0) continue;
    for (const prod of cat.products) {
      await db.query(
        `INSERT INTO products (name, description, specifications, price, stock, category_id, supplier_id, delivery_method_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [prod.name, prod.description, JSON.stringify(prod.specifications), prod.price, prod.stock,
          categoryId, supplierIds[i % supplierIds.length], deliveryIds[i % deliveryIds.length]]
      );
      i++; created++;
    }
  }
  console.log(n > 0 ? 'Produsele există deja, nu s-au adăugat altele.' : `Seed terminat: ${created} produse adăugate.`);
  console.log(`Admin: ${config.admin.email} / ${config.admin.password}   |   Utilizator: ${DEMO_USER.email} / ${DEMO_USER.password}`);
  await db.pool.end();
})().catch((err) => {
  console.error('seed a eșuat:', err.message);
  process.exit(1);
});
