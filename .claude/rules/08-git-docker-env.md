# 08 — Git, Docker & Env

## Repo layout (polyrepo)
- Five repos: `vaultpay-gateway`, `vaultpay-auth`, `vaultpay-wallet`, `vaultpay-vault`,
  `vaultpay-admin`. Each is standalone and self-contained (duplicated shared code).
- Each repo root: `package.json`, `.gitignore`, `.dockerignore`, `.env.example`,
  `Dockerfile`, `docker-compose.yml`, `eslint`/`prettier` config, `prisma/`, `src/`, `README.md`.

## .gitignore (must include)
```
node_modules/
.env
.env.*
!.env.example
dist/
coverage/
*.log
uploads/
```

## .env.example (commit this; never commit real .env)
```
NODE_ENV=development
PORT=4001
DATABASE_URL=postgresql://vaultpay:vaultpay@localhost:5432/vaultpay_auth
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me
S2S_SECRET=change-me
ENCRYPTION_ENABLED=false
ENCRYPTION_KEY=change-me-32-bytes
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=
MAIL_PASS=
CLUSTER_ENABLED=false
```
- `shared/config/env.js` validates all required keys with Zod at boot and **fails fast**.

## Dockerfile (per service, multi-stage)
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 4001
CMD ["node", "src/server.js"]
```

## docker-compose.yml
- Each service repo gets its own compose with: the service, its **own** Postgres, and Redis
  (or a shared infra compose for local dev). Keep everything **free & local** (Postgres,
  Redis, MinIO, Mailtrap). No paid cloud dependencies.

> Migration workflow and conventions are defined in `10-database-migrations.md` and must be
> identical across all services. This file only covers committing the artifacts.

## DO / DON'T
- **DO** keep `.env.example` in sync with `env.js` validation.
- **DO** commit `prisma/migrations/**` and `migration_lock.toml`.
- **DO** run `prisma migrate deploy` via an explicit step, not implicitly on boot in prod.
- **DON'T** commit `.env`, secrets, `node_modules`, or `uploads/`.
- **DON'T** share one database across services.

## Commit hygiene
- Conventional commits: `feat(auth): ...`, `fix(wallet): ...`, `chore: ...`, `docs: ...`.
- Small, slice-sized commits aligned with the Phase 2 build steps.
