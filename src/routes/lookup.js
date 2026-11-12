const express = require('express');
const Joi = require('joi');
const db = require('../db');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { adminOnly } = require('../middleware/auth');

const idParam = Joi.object({ id: Joi.number().integer().positive().required() });

/**
 * Generează CRUD pentru un tabel simplu (categories, suppliers, delivery_methods).
 * GET este public; POST/PUT/DELETE doar ADMIN.
 *   table   - numele tabelei
 *   columns - coloanele editabile (aceleași nume ca în JSON)
 *   schema  - schema Joi pentru body (POST și PUT)
 *   label   - numele afișat în mesaje (ex. 'Category')
 */
function createLookupRouter({ table, columns, schema, label, orderBy = 'name' }) {
  const router = express.Router();
  const selectCols = ['id', ...columns].join(', ');

  const findOr404 = async (id) => {
    const rows = await db.query(`SELECT ${selectCols} FROM ${table} WHERE id = $1`, [id]);
    if (!rows.length) throw new HttpError(404, `${label} not found`);
    return rows[0];
  };

  // Rutele extra (ex. /categories/:id/products) se montează înainte de acest router.
  router.get('/', asyncHandler(async (req, res) => {
    res.json(await db.query(`SELECT ${selectCols} FROM ${table} ORDER BY ${orderBy}`));
  }));

  router.get('/:id', validate(idParam, 'params'), asyncHandler(async (req, res) => {
    res.json(await findOr404(req.params.id));
  }));

  router.post('/', adminOnly, validate(schema), asyncHandler(async (req, res) => {
    const values = columns.map((c) => req.body[c] ?? null);
    const [created] = await db.query(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
      values
    );
    res.status(201).json(await findOr404(created.id));
  }));

  router.put('/:id', adminOnly, validate(idParam, 'params'), validate(schema), asyncHandler(async (req, res) => {
    await findOr404(req.params.id);
    const values = columns.map((c) => req.body[c] ?? null);
    await db.query(`UPDATE ${table} SET ${columns.map((c, i) => `${c} = $${i + 1}`).join(', ')} WHERE id = $${columns.length + 1}`, [...values, req.params.id]);
    res.json(await findOr404(req.params.id));
  }));

  router.delete('/:id', adminOnly, validate(idParam, 'params'), asyncHandler(async (req, res) => {
    await findOr404(req.params.id);
    await db.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]); // 409 dacă e referit de produse
    res.status(204).end();
  }));

  return router;
}

module.exports = createLookupRouter;
