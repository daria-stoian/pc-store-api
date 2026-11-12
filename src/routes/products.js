const express = require('express');
const Joi = require('joi');
const db = require('../db');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { adminOnly } = require('../middleware/auth');
const productService = require('../services/productService');

const router = express.Router();

const idParam = Joi.object({ id: Joi.number().integer().positive().required() });

const listQuery = Joi.object({
  page: Joi.number().integer().min(0).default(0),
  size: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('id', 'name', 'price', 'stock').default('id'),
  order: Joi.string().lowercase().valid('asc', 'desc').default('asc'),
});

const searchQuery = listQuery.keys({
  q: Joi.string().trim().min(1).max(100).required(),
});

const productBody = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().max(5000).allow('', null),
  // perechi cheie-valoare, diferite pe categorie (ex. { "socket": "AM5", "nuclee": 6 })
  specifications: Joi.object().unknown(true).allow(null).default({}),
  price: Joi.number().precision(2).min(0).max(99999999.99).required(),
  stock: Joi.number().integer().min(0).required(),
  categoryId: Joi.number().integer().positive().required(),
  supplierId: Joi.number().integer().positive().required(),
  deliveryMethodId: Joi.number().integer().positive().required(),
});

// GET /products?page=0&size=20&sort=price&order=asc — public
router.get('/', validate(listQuery, 'query'), asyncHandler(async (req, res) => {
  res.json(await productService.list({}, req.query));
}));

// GET /products/search?q=ryzen — trebuie declarat ÎNAINTE de /:id
router.get('/search', validate(searchQuery, 'query'), asyncHandler(async (req, res) => {
  res.json(await productService.list({ q: req.query.q }, req.query));
}));

router.get('/:id', validate(idParam, 'params'), asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  res.json(product);
}));

router.post('/', adminOnly, validate(productBody), asyncHandler(async (req, res) => {
  await productService.assertReferencesExist(req.body);
  const id = await productService.create(req.body);
  res.status(201).json(await productService.getById(id));
}));

router.put('/:id', adminOnly, validate(idParam, 'params'), validate(productBody), asyncHandler(async (req, res) => {
  if (!(await productService.getById(req.params.id))) throw new HttpError(404, 'Product not found');
  await productService.assertReferencesExist(req.body);
  await productService.update(req.params.id, req.body);
  res.json(await productService.getById(req.params.id));
}));

router.delete('/:id', adminOnly, validate(idParam, 'params'), asyncHandler(async (req, res) => {
  const deleted = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
  if (!deleted.length) throw new HttpError(404, 'Product not found');
  res.status(204).end();
}));

module.exports = router;
