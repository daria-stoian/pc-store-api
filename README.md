# PC Store API — Raportarea I

REST API pentru un magazin de componente PC. **Node.js + Express, PostgreSQL, JWT, Swagger (OpenAPI).**

Acoperă cerințele Raportării I: autentificare (admin și utilizator), adăugare/editare/ștergere produse (admin), câmpurile cerute pentru produs, răsfoire produse și categorii, căutare.

## Pornire rapidă (Windows)

Dublu-click pe **`start.bat`** (sau rulează `.\start.bat` în terminal). La prima rulare:
instalează pachetele, îți cere **parola PostgreSQL** (restul îl completează singur, inclusiv `JWT_SECRET`),
creează baza `pc_store` cu tabelele și datele demo, apoi pornește serverul.
Apoi deschide http://localhost:3000/api-docs. La rulările următoare pornește direct.

Asigură-te doar că serviciul PostgreSQL rulează (dacă ai pgAdmin și te poți conecta la server, rulează).

## Pornire manuală


Cerințe: Node.js 18+ și PostgreSQL 12+ (cel instalat cu pgAdmin; sau `docker compose up -d` pentru un PostgreSQL local).

```bash
npm install
npm run setup               # creează .env (cere parola PostgreSQL, generează JWT_SECRET)
npm run db:setup            # creează baza + tabelele și inserează datele demo
npm run dev                 # sau: npm start
```

- Interfața web (magazinul): http://localhost:3000/
- Swagger UI: http://localhost:3000/api-docs
- Specificația OpenAPI (JSON): http://localhost:3000/api-docs.json
- Health check: http://localhost:3000/health

Conturi create de seed:

| Rol | Email | Parolă |
|---|---|---|
| ADMIN | `admin@pcstore.ro` | `Admin123!` (se pot schimba din `.env`: `ADMIN_EMAIL`, `ADMIN_PASSWORD`) |
| USER | `user@pcstore.ro` | `User1234!` |

Seed-ul adaugă 8 categorii, 4 furnizori (fictivi), 3 metode de livrare și 40 de produse (5 pe categorie, cu specificații diferite pe categorie). Poate fi rulat de mai multe ori fără să dubleze datele.

## Endpoint-uri

| Metodă | Cale | Acces | Descriere |
|---|---|---|---|
| POST | `/auth/register` | public | Utilizator nou (rol `USER`) |
| POST | `/auth/login` | public | Returnează token JWT |
| GET | `/auth/me` | autentificat | Utilizatorul curent |
| GET | `/products?page=0&size=20&sort=price&order=desc` | public | Listă paginată |
| GET | `/products/search?q=ryzen` | public | Căutare în nume și descriere |
| GET | `/products/{id}` | public | Detalii produs |
| POST | `/products` | ADMIN | Adaugă produs |
| PUT | `/products/{id}` | ADMIN | Editează produs (înlocuire completă) |
| DELETE | `/products/{id}` | ADMIN | Șterge produs |
| GET | `/categories` | public | Toate categoriile |
| GET | `/categories/{id}` | public | O categorie |
| GET | `/categories/{id}/products` | public | Produsele categoriei (paginat) |
| POST/PUT/DELETE | `/categories[/{id}]` | ADMIN | CRUD categorii |
| GET, POST/PUT/DELETE | `/suppliers[/{id}]` | public / ADMIN | CRUD furnizori |
| GET, POST/PUT/DELETE | `/delivery-methods[/{id}]` | public / ADMIN | CRUD metode de livrare |

Autentificare: header `Authorization: Bearer <token>`. Fără token → **401**, rol insuficient → **403**.

Erorile au format uniform:

```json
{ "error": { "status": 400, "message": "Validation failed", "details": [{ "field": "price", "message": "..." }] } }
```

### Câmpurile produsului (cerința proiectului)

| Cerință | Câmp JSON | Observații |
|---|---|---|
| nume | `name` | |
| descriere | `description` | |
| specificații | `specifications` | obiect JSON liber, diferit pe categorie |
| preț | `price` | ≥ 0, 2 zecimale |
| stoc | `stock` | întreg ≥ 0 |
| furnizor | `supplierId` → `supplier` | tabelă separată |
| modalitate de livrare | `deliveryMethodId` → `deliveryMethod` | tabelă separată, are și `cost` (util la Raportarea II) |
| categorie | `categoryId` → `category` | tabelă separată |

Exemplu `POST /products`:

```json
{
  "name": "Procesor AMD Ryzen 5 5600",
  "description": "Procesor 6 nuclee pentru platforma AM4.",
  "specifications": { "socket": "AM4", "nuclee": 6, "threads": 12, "tdp": "65W" },
  "price": 649.99,
  "stock": 15,
  "categoryId": 1,
  "supplierId": 1,
  "deliveryMethodId": 1
}
```

## Interfața web

Pagina `http://localhost:3000/` folosește exact API-ul de mai sus (nu are cod separat pe server):
- oricine: răsfoiește produsele, filtrează pe categorii, caută, sortează, vede detaliile (specificații, furnizor, livrare);
- **Intră în cont / Creează cont** (`/auth/login`, `/auth/register`);
- admin: butoanele **Adaugă produs**, **Editează** și **Șterge** (pe un cont de user nu apar; API-ul răspunde 403 oricum).

Fișierul este `src/public/index.html`.

## Testare cu Swagger

1. Deschide http://localhost:3000/api-docs
2. POST /auth/login cu admin@pcstore.ro / Admin123! și copiază valoarea `token`.
3. Apasă Authorize (lăcățelul), lipește tokenul și confirmă.
4. Testează: creare, editare și ștergere produs ca admin; apoi login ca user@pcstore.ro și încearcă o scriere (răspuns 403); apoi răsfoire pe categorii și căutare.

## Structura proiectului

```
db/schema.sql              schema PostgreSQL (users, categories, suppliers, delivery_methods, products)
scripts/init-db.js         creează baza și tabelele
scripts/seed.js            conturi, categorii, furnizori, livrări, produse (date în seedData.js)
src/server.js              pornire server
src/app.js                 Express, Swagger UI, montarea rutelor
src/db.js                  pool pg (PostgreSQL)
src/middleware/            auth (JWT + roluri), validate (Joi), errors
src/routes/                auth, products, categories, suppliers, deliveryMethods, lookup (CRUD generic)
src/services/              productService (query-uri, paginare, căutare)
src/public/index.html      interfața web (HTML + CSS + JS, fără framework), servită la /
src/docs/openapi.yaml      documentația Swagger
```

## Decizii de proiectare

- **Securitate:** parole cu bcrypt; rolul nu se citește niciodată din body la înregistrare (nu te poți face admin singur); același mesaj la email inexistent și parolă greșită; query-uri parametrizate (fără SQL injection); sortarea folosește o listă albă de coloane.
- **PUT** înlocuiește complet produsul (trebuie trimise toate câmpurile).
- **Ștergere cu dependențe:** o categorie, un furnizor sau o metodă de livrare folosite de produse nu pot fi șterse (**409**).
- **Căutare:** cuvintele din `q` trebuie să apară fiecare în nume sau descriere (ex. `q=ryzen 7`); caracterele `%` și `_` sunt tratate literal.
- **Paginare:** `page` pornește de la 0, `size` între 1 și 100; răspunsul are `content`, `page`, `size`, `totalElements`, `totalPages`.

## Pentru Raportarea II

Schema curentă nu trebuie schimbată: `wishlist`, `cart_items`, `orders`, `order_items` și `promo_codes` doar vor referi `users(id)` și `products(id)`. Filtrarea (preț, stoc, furnizor, livrare, operatori și/sau) se poate adăuga în `productService.list` ca filtre suplimentare.

## Împărțirea pe echipă (din schiță)

- **Persoana A:** `src/routes/auth.js`, `src/middleware/`, CRUD produse (`routes/products.js`), validări.
- **Persoana B:** `categories`, `suppliers`, `delivery-methods`, răsfoire și căutare (`services/productService.js`), date de test.
