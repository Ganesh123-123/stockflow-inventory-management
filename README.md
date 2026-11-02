# StockFlow

StockFlow is a multi-tenant inventory management MVP built with React, Vite, Express, and Prisma. Local development uses SQLite; the Render deployment uses PostgreSQL. Organizations have isolated product catalogs, live dashboard metrics, configurable low-stock thresholds, and account-based JWT authentication.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

1. Copy `.env.example` to `backend/.env` and set `JWT_SECRET` to a long, random value. The default SQLite database is `backend/prisma/dev.db`.
2. Install backend dependencies and generate the Prisma client:

   ```sh
   cd backend
   npm install
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

## Deploy to Render

The repository includes a Render Blueprint in `render.yaml`. Push the repository to GitHub, then in Render select **New + → Blueprint**, connect this repository, and apply the Blueprint. It creates one Node web service for the API and built frontend, plus a PostgreSQL database. Render generates `JWT_SECRET` and connects the database automatically; the database schema is synchronized when the service starts.

The Blueprint selects Render's free plans to avoid recurring service charges, subject to Render's workspace usage limits. Free web services can spin down when idle, and free PostgreSQL databases expire after 30 days, so this setup is for a demo. Upgrade the service and database plans in Render for a continuously available deployment with persistent production data.

## Included functionality

- Signup creates an organization and its first user in a database transaction; passwords are bcrypt-hashed.
- Authenticated product CRUD, search, quantity management, and low-stock threshold inheritance.
- Organization-scoped product access is enforced by deriving the tenant from the verified JWT user.
- Dashboard counts, inventory value, low-stock alerts, and recent products are queried from SQLite locally and PostgreSQL on Render.
- Organization settings persist the name and default threshold.

## API

- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/products`, `POST /api/products`, `GET /api/products/:id`, `PUT /api/products/:id`, `DELETE /api/products/:id`
- `GET /api/dashboard/stats`, `GET /api/dashboard/low-stock`, `GET /api/dashboard/recent-products`
- `GET /api/settings`, `PUT /api/settings`

Protected endpoints require `Authorization: Bearer <token>`. Health check: `GET /health`.
