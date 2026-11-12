-- Schema minimă pentru Raportarea I (PostgreSQL 12+)
-- Rulează: npm run db:init   (sau execută acest fișier în pgAdmin, în baza de date pc_store, cu Query Tool)
--
-- Tabelele pentru Raportarea II (wishlist, cart_items, orders, order_items, promo_codes)
-- se adaugă mai târziu; ele doar vor referi users(id) și products(id), deci schema de mai jos nu se schimbă.

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  role          VARCHAR(10)  NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS suppliers (
  id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name    VARCHAR(150) NOT NULL UNIQUE,
  contact VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS delivery_methods (
  id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  cost NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (cost >= 0)
);

CREATE TABLE IF NOT EXISTS products (
  id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name               VARCHAR(200) NOT NULL,
  description        TEXT,
  specifications     JSONB NOT NULL DEFAULT '{}'::jsonb,
  price              NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock              INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id        INTEGER NOT NULL REFERENCES categories (id),
  supplier_id        INTEGER NOT NULL REFERENCES suppliers (id),
  delivery_method_id INTEGER NOT NULL REFERENCES delivery_methods (id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products (supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_delivery ON products (delivery_method_id);
CREATE INDEX IF NOT EXISTS idx_products_name     ON products (name);
