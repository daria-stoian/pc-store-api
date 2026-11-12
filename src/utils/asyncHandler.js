// Trimite erorile din handler-ele async către middleware-ul de erori (Express 4 nu o face singur).
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
