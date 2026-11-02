# StockFlow

StockFlow is a multi-tenant inventory management MVP built with React, Vite, Express, Prisma, and SQLite. Organizations have isolated product catalogs, live dashboard metrics, configurable low-stock thresholds, and account-based JWT authentication.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

1. Copy `.env.example` to `backend/.env` and replace `JWT_SECRET` with a long, random value. The SQLite database is local to the backend.
2. Install backend dependencies and generate the Prisma client:

   ```sh
   cd backend
   npm install
   npm run db:generate
   npm run db:push
   npm run dev
   ```

3. In a second terminal, install and start the frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173` and create an organization account. The API listens at `http://localhost:5000`.

To use a different API URL, set `VITE_API_URL` in `frontend/.env` to the API base URL (for example, `http://localhost:5000/api`).

## Included functionality

- Signup creates an organization and its first user in a database transaction; passwords are bcrypt-hashed.
- Authenticated product CRUD, search, quantity management, and low-stock threshold inheritance.
- Organization-scoped product access is enforced by deriving the tenant from the verified JWT user.
- Dashboard counts, inventory value, low-stock alerts, and recent products are queried from SQLite.
- Organization settings persist the name and default threshold.

## API

- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/products`, `POST /api/products`, `GET /api/products/:id`, `PUT /api/products/:id`, `DELETE /api/products/:id`
- `GET /api/dashboard/stats`, `GET /api/dashboard/low-stock`, `GET /api/dashboard/recent-products`
- `GET /api/settings`, `PUT /api/settings`

Protected endpoints require `Authorization: Bearer <token>`. Health check: `GET /health`.
