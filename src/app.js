const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Swagger UI: http://localhost:3000/api-docs  (specificația brută: /api-docs.json)
const openapi = YAML.parse(fs.readFileSync(path.join(__dirname, 'docs', 'openapi.yaml'), 'utf8'));
app.get('/api-docs.json', (req, res) => res.json(openapi));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi, { swaggerOptions: { persistAuthorization: true } }));

// Colecția Postman și environment-ul, ca să le poți importa din link:
//   Postman -> Import -> lipește http://localhost:3000/postman/PC-Store-API.postman_collection.json
app.use('/postman', express.static(path.join(__dirname, '..', 'postman')));

// Interfața web (src/public/index.html) este servită la http://localhost:3000/
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', require('./routes/auth'));
app.use('/categories', require('./routes/categories'));
app.use('/suppliers', require('./routes/suppliers'));
app.use('/delivery-methods', require('./routes/deliveryMethods'));
app.use('/products', require('./routes/products'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
