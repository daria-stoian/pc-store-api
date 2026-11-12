const db = require('../db');
const HttpError = require('../utils/httpError');

const BASE_SELECT = `
  SELECT p.id, p.name, p.description, p.specifications, p.price, p.stock,
         p.category_id, c.name AS category_name,
         p.supplier_id, s.name AS supplier_name,
         p.delivery_method_id, d.name AS delivery_method_name, d.cost AS delivery_method_cost,
         p.created_at, p.updated_at
  FROM products p
  JOIN categories c       ON c.id = p.category_id
  JOIN suppliers s        ON s.id = p.supplier_id
  JOIN delivery_methods d ON d.id = p.delivery_method_id`;

// Coloana JSONB vine deja parsată (obiect) din driverul pg.
const parseJson = (v) => v ?? {};

function toDto(r) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    specifications: parseJson(r.specifications),
    price: r.price,
    stock: r.stock,
    category: { id: r.category_id, name: r.category_name },
    supplier: { id: r.supplier_id, name: r.supplier_name },
    deliveryMethod: { id: r.delivery_method_id, name: r.delivery_method_name, cost: r.delivery_method_cost },
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// Caractere speciale pentru LIKE/ILIKE (escape cu '\' — implicit în PostgreSQL)
const escapeLike = (s) => s.replace(/[\\%_]/g, (ch) => `\\${ch}`);

// Căutare fără diacritice: "placa" găsește "Placă", "Plăci video" etc.
// - în JS scoatem diacriticele din cuvântul căutat (ă→a, â→a, î→i, ș/ş→s, ț/ţ→t);
// - în SQL înlocuim aceleași litere din coloană cu translate() (funcție standard, nu cere extensii).
const stripDiacritics = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const foldSql = (col) => `translate(${col}, 'ăâîșşțţĂÂÎȘŞȚŢ', 'aaisstt' || 'AAISSTT')`;

/**
 * Listă paginată.
 * filters: { categoryId?, q? }   q = cuvinte separate prin spațiu; fiecare trebuie să apară în nume, descriere SAU numele categoriei.
 * paging:  { page (de la 0), size, sort, order }   (valorile sunt deja validate în rută)
 */
async function list(filters, { page, size, sort, order }) {
  const where = [];
  const params = [];

  // Fiecare valoare adăugată în `params` primește placeholder-ul $<poziția ei>.
  const add = (value) => { params.push(value); return `$${params.length}`; };

  if (filters.categoryId) {
    where.push(`p.category_id = ${add(filters.categoryId)}`);
  }
  if (filters.q) {
    const words = filters.q.split(/\s+/).filter(Boolean).slice(0, 5);
    for (const w of words) {
      const ph = add(`%${escapeLike(stripDiacritics(w))}%`);
      // ILIKE = fără diferență majuscule/minuscule; foldSql = fără diferență de diacritice
      where.push(`(${foldSql('p.name')} ILIKE ${ph} OR ${foldSql('p.description')} ILIKE ${ph}
        OR p.category_id IN (SELECT id FROM categories WHERE ${foldSql('name')} ILIKE ${ph}))`);
    }
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // `sort` și `order` provin dintr-o listă albă (Joi .valid), deci pot fi puse în SQL în siguranță.
  const sortColumn = { id: 'p.id', name: 'p.name', price: 'p.price', stock: 'p.stock' }[sort];
  const direction = order === 'desc' ? 'DESC' : 'ASC';

  const [{ total }] = await db.query(`SELECT COUNT(*)::int AS total FROM products p ${whereSql}`, params);
  const rows = await db.query(
    `${BASE_SELECT} ${whereSql} ORDER BY ${sortColumn} ${direction}, p.id ASC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, size, page * size]
  );

  return {
    content: rows.map(toDto),
    page,
    size,
    totalElements: total,
    totalPages: Math.ceil(total / size),
  };
}

async function getById(id) {
  const rows = await db.query(`${BASE_SELECT} WHERE p.id = $1`, [id]);
  return rows.length ? toDto(rows[0]) : null;
}

/** Mesaje clare (400) în loc de eroarea brută de foreign key. */
async function assertReferencesExist({ categoryId, supplierId, deliveryMethodId }) {
  const checks = [
    ['categories', categoryId, 'categoryId'],
    ['suppliers', supplierId, 'supplierId'],
    ['delivery_methods', deliveryMethodId, 'deliveryMethodId'],
  ];
  const details = [];
  for (const [table, id, field] of checks) {
    const rows = await db.query(`SELECT id FROM ${table} WHERE id = $1`, [id]);
    if (!rows.length) details.push({ field, message: `No record with id ${id}` });
  }
  if (details.length) throw new HttpError(400, 'Invalid reference', details);
}

const toRow = (b) => [
  b.name,
  b.description ?? null,
  JSON.stringify(b.specifications ?? {}),
  b.price,
  b.stock,
  b.categoryId,
  b.supplierId,
  b.deliveryMethodId,
];

async function create(body) {
  const [created] = await db.query(
    `INSERT INTO products (name, description, specifications, price, stock, category_id, supplier_id, delivery_method_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    toRow(body)
  );
  return created.id;
}

async function update(id, body) {
  await db.query(
    `UPDATE products SET name = $1, description = $2, specifications = $3, price = $4, stock = $5,
            category_id = $6, supplier_id = $7, delivery_method_id = $8, updated_at = NOW() WHERE id = $9`,
    [...toRow(body), id]
  );
}

module.exports = { list, getById, create, update, assertReferencesExist };