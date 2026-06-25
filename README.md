# VaultPay — Wallet Service

Customer wallets, balances, an append-only ledger, and atomic wallet-to-wallet
transfers for **VaultPay**.

Part of the VaultPay polyrepo (database-per-service, duplicated shared code). The rules in
[`.claude/rules/`](.claude/rules) are the source of truth; the cross-service table catalog is
[`.claude/docs/vaultpay-data-dictionary.xlsx`](.claude/docs).

---

## Tech stack

- **Runtime:** Node.js ≥ 20, Express, ESM (`"type": "module"`)
- **DB:** PostgreSQL — this service owns the **`vaultpay_wallet`** database (same server as
  auth, separate database)
- **ORM:** Prisma · **Cache / rate-limit:** Redis (ioredis)
- **Validation:** Zod · **Auth:** customer JWT (verify-only, shared secret) + S2S JWT
- **Money:** `Decimal(20,4)`; balance arithmetic is atomic and concurrency-safe (see below)
- **Containers:** Docker + Docker Compose

Everything runs **free and locally** — no paid third-party services.

---

## Prerequisites

- Node.js ≥ 20 and npm
- PostgreSQL on `:5432` (the shared VaultPay server) or the bundled `docker compose`
- Redis on `:6379`

---

## Setup (local)

```bash
# 1. install deps
npm install

# 2. environment
cp .env.example .env          # JWT_ACCESS_SECRET / S2S_SECRET must match auth-service

# 3. create the SEPARATE wallet database on the shared server (one-time, as postgres)
psql -U postgres -h localhost -p 5432 -f scripts/db-bootstrap.sql

# 4. apply migrations
npm run db:deploy

# 5. run
npm run dev                   # http://localhost:4002  (Swagger at /docs)
```

### With Docker Compose (self-contained stack)

```bash
docker compose up --build     # its own Postgres (host 5442) + Redis (6389) + service
```

### Connecting a DB client (DBeaver)

| Field | Value |
|-------|-------|
| Host / Port | `localhost` / `5432` |
| Database | `vaultpay_wallet` |
| User / Password | `vaultpay` / `vaultpay` |

> The auth and wallet databases (`vaultpay_auth`, `vaultpay_wallet`) live on the **same**
> PostgreSQL server as **separate databases** — database-per-service.

---

## NPM scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` / `start` | Run with nodemon / run |
| `npm run db:migrate` | Create + apply a dev migration |
| `npm run db:deploy` | Apply committed migrations (CI/prod) |
| `npm run db:status` | Migration drift check |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run lint` / `format` | ESLint / Prettier |

---

## Endpoints

Base URL: `http://localhost:4002` · OpenAPI: `/openapi.json` · Swagger UI: `/docs` ·
Health: `/health`. All endpoints require a customer **Bearer** access token (issued by
auth-service, verified here with the shared `JWT_ACCESS_SECRET`).

### `wallet`
`POST /wallets` · `GET /wallets` · `GET /wallets/:id`

### `transaction`
`POST /wallets/:id/deposit` · `POST /wallets/:id/withdraw` ·
`GET /wallets/:id/transactions` · `GET /transactions/:id`

### `transfer`
`POST /transfers` · `GET /transfers` · `GET /transfers/:id`

`deposit`/`withdraw`/`transfer` accept an optional **`reference`** (idempotency key) so
retries are safe.

---

## Money & concurrency (correctness)

- Amounts are **`Decimal(20,4)`** — never JS floats.
- **Withdraw** is a single atomic conditional update inside `prisma.$transaction`:
  `UPDATE wallets SET balance = balance - :amt WHERE id = :id AND status='ACTIVE' AND balance >= :amt`.
  PostgreSQL row-locks the row and re-checks the predicate under READ COMMITTED, so concurrent
  debits serialize and **balances can never go negative** (verified: 20 parallel withdrawals
  from a balance of 100 → exactly 10 succeed, final balance 0).
- **Transfer** runs both legs in one `prisma.$transaction` and locks both wallet rows with
  `SELECT … FOR UPDATE` in **sorted id order**, so concurrent `A→B` and `B→A` transfers
  acquire locks in the same order and **cannot deadlock** (verified: 20 interleaved opposing
  transfers → 0 errors, funds conserved, no negative balances).
- Idempotency `reference` columns are `UNIQUE`; duplicate references are replayed (same result)
  or rejected with `DUPLICATE_REFERENCE`.

---

## Response envelope

Success:
```json
{ "success": true, "data": { }, "meta": { }, "error": null }
```
Error:
```json
{ "success": false, "data": null, "error": { "code": "INSUFFICIENT_FUNDS", "message": "..." } }
```
Monetary values are returned as **strings** to preserve decimal precision.

---

## Project structure

```
src/
  modules/{wallet,transaction,transfer}/
    constants/ routes/ controllers/ validators/ services/ repositories/ parsers/ docs/ types/
  shared/
    config/      env, database (Prisma singleton), redis, logger, swagger, cluster
    middleware/  ipTracker, rateLimiter, auth (JWT), serviceAuth, validate, encryption,
                 response, notFound, errorHandler
    utils/ (incl. money) constants/ errors/ validators/
  app.js         builds the Express app (no listen)
  server.js      connects DB, listens, cluster + graceful shutdown
prisma/          schema.prisma, migrations/, seed.js
scripts/         db-bootstrap.sql (creates vaultpay_wallet)
```

Request flow (mandatory): `ipTracker → rateLimiter → auth → encryption(decrypt) → validate →
controller → service → repository → Prisma → parser → response → errorHandler`.

Hard rules: Prisma is used **only** in `repositories/`; controllers hold no business logic;
services hold no Prisma; every folder has an `index.js` barrel; `userId` is a plain reference
to auth's `users.id` (no cross-database foreign keys).

---

## Environment variables

See [`.env.example`](.env.example): DB, Redis, `JWT_ACCESS_SECRET` (must match auth),
`S2S_SECRET` + S2S client creds + `AUTH_SERVICE_URL`, `ENCRYPTION_ENABLED`/key, rate limits,
CORS, cluster. `src/shared/config/env.js` validates them at boot and **fails fast**.
