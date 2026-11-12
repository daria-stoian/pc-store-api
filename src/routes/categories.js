const express = require('express');
const Joi = require('joi');
const db = require('../db');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const createLookupRouter = require('./lookup');
const productService = require('../services/productService');

const router = express.Router();

const idParam = Joi.object({ id: Joi.number().integer().positive().required() });
const pagingQuery = Joi.object({
  page: Joi.number().integer().min(0).default(0),
  size: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('id', 'name', 'price', 'stock').default('id'),
  order: Joi.string().lowercase().valid('asc', 'desc').default('asc'),
});

// GET /categories/:id/products — produsele unei categorii (public, paginat)
router.get('/:id/products', validate(idParam, 'params'), validate(pagingQuery, 'query'), asyncHandler(async (req, res) => {
  const cat = await db.query('SELECT id FROM categories WHERE id = $1', [req.params.id]);
  if (!cat.length) throw new HttpError(404, 'Category not found');
  res.json(await productService.list({ categoryId: req.params.id }, req.query));
}));

// GET /categories, GET /categories/:id, POST, PUT, DELETE (admin)
router.use('/', createLookupRouter({
  table: 'categories',
  label: 'Category',
  columns: ['name', 'description'],
  schema: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().max(500).allow('', null),
  }),
}));

module.exports = router;
