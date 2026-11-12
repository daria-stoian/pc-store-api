const HttpError = require('../utils/httpError');

/** validate(schema, 'body' | 'query' | 'params') — înlocuiește req[source] cu valoarea validată/convertită. */
module.exports = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  if (error) {
    const details = error.details.map((d) => ({ field: d.path.join('.'), message: d.message.replace(/"/g, "'") }));
    return next(new HttpError(400, 'Validation failed', details));
  }
  // În Express 4 req.query poate fi suprascris direct.
  req[source] = value;
  next();
};
