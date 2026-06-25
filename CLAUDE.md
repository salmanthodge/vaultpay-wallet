# VaultPay — wallet-service (Claude context)

This repo is one service in the **VaultPay** polyrepo (database-per-service, duplicated
shared code — no shared npm package). The rules in `.claude/rules/` are the **source of
truth** and must be followed exactly. When something isn't covered by a rule, **ASK** —
do not improvise.

## Rules (read these first)
- @.claude/rules/00-overview.md — project summary, stack, phase/gate workflow
- @.claude/rules/01-architecture.md — folder structure, polyrepo, database-per-service
- @.claude/rules/02-naming.md — file / variable / function / REST URL naming
- @.claude/rules/03-request-flow.md — route → controller → service → repository → parser flow
- @.claude/rules/04-coding-standards.md — ESM, barrels, errors, async, no-Prisma-outside-repo
- @.claude/rules/05-security.md — JWT / session / S2S, RBAC, encryption toggle, rate limit, VAPT
- @.claude/rules/06-validation.md — Zod validators + validate middleware
- @.claude/rules/07-docs-swagger.md — per-endpoint swagger docs
- @.claude/rules/08-git-docker-env.md — repo layout, Dockerfile, compose, .env
- @.claude/rules/09-workflow.md — plan → confirm → build, gate by gate
- @.claude/rules/10-database-migrations.md — migration discipline, identical across services

## Data dictionary
- `.claude/docs/vaultpay-data-dictionary.xlsx` — all tables (purpose / reason / description) + columns
- `.claude/docs/generate_data_dictionary.py` — regenerate after any schema change

## Non-negotiable hard rules
- Prisma is imported **ONLY** inside `repositories/`.
- Controllers hold no business logic; services hold no Prisma.
- Every folder has an `index.js` barrel.
- Request flow order: ipTracker → rateLimiter → auth/serviceAuth → encryption(decrypt) → validate → controller → service → repository → parser → response → errorHandler.
- Encryption middleware is toggled by `ENCRYPTION_ENABLED`.
- Everything runs free & local. No paid services.
- Commit every migration; never edit an applied migration; `migrate deploy` (never `db push`) outside dev.

## This service
- **Port:** 4002 · **Database:** `vaultpay_wallet` (same Postgres server as auth, separate DB).
- **Auth:** verifies the customer JWT locally with the shared `JWT_ACCESS_SECRET` (stateless); S2S between services.
- **Domain:** wallets, balances, ledger transactions, transfers.
- **Money:** amounts are `Decimal(20,4)`; debits use conditional updates inside `prisma.$transaction` (no negative balances, no floats); `reference` is a unique idempotency key.
- **Tables:** `wallets`, `transactions`, `transfers` (see data dictionary once schema is added).
- **No cross-DB FKs:** `userId` is a plain reference to auth's `users.id`.
