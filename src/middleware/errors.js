const HttpError = require('../utils/httpError');

function notFound(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let { status, message, details } = err;

  // Erori de la PostgreSQL (coduri SQLSTATE)
  if (err.code === '23505') { // unique_violation
    status = 409; message = 'Duplicate value: a record with the same unique value already exists';
  } else if (err.code === '23503') { // foreign_key_violation
    if (/still referenced/i.test(err.detail || '')) {
      status = 409; message = 'Cannot delete: the record is still referenced by other records (e.g. products)';
    } else {
      status = 400; message = 'Invalid reference: categoryId, supplierId or deliveryMethodId does not exist';
    }
  } else if (err.type === 'entity.parse.failed') {
    status = 400; message = 'Malformed JSON body';
  }

  if (!status) {
    status = 500;
    message = 'Internal server error';
    console.error(err);
  }
  res.status(status).json({ error: { status, message, ...(details && { details }) } });
}

module.exports = { notFound, errorHandler };
