const { Pool, types } = require('pg');
const config = require('./config/env');

// NUMERIC (oid 1700) vine implicit ca string; îl convertim în număr (prețuri, costuri).
types.setTypeParser(1700, (v) => parseFloat(v));

const pool = new Pool({ ...config.db, max: 10 });

/**
 * Rulează un query parametrizat cu placeholder-e $1, $2, ... (previn SQL injection).
 * Returnează array-ul de rânduri (pentru INSERT/UPDATE/DELETE folosește `RETURNING ...`).
 */
async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

module.exports = { query, pool };
