const Joi = require('joi');
const createLookupRouter = require('./lookup');

module.exports = createLookupRouter({
  table: 'suppliers',
  label: 'Supplier',
  columns: ['name', 'contact'],
  schema: Joi.object({
    name: Joi.string().trim().min(2).max(150).required(),
    contact: Joi.string().trim().max(255).allow('', null),
  }),
});
