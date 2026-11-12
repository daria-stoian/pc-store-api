const Joi = require('joi');
const createLookupRouter = require('./lookup');

module.exports = createLookupRouter({
  table: 'delivery_methods',
  label: 'Delivery method',
  columns: ['name', 'cost'],
  schema: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    cost: Joi.number().precision(2).min(0).max(99999.99).required(),
  }),
});
