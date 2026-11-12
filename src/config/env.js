require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pc_store',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  admin: {
    email: (process.env.ADMIN_EMAIL || 'admin@pcstore.ro').toLowerCase(),
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
  },
};

module.exports = config;
