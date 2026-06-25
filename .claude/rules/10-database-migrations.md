# 10 — Database & Migrations

## Principle
Database-per-service: each service has **its own** `prisma/schema.prisma`, **its own**
database, and **its own** `prisma/migrations/` history. There is no shared DB. "Synced
across services" means **every repo follows the exact same migration discipline** below —
identical workflow, naming, and tooling — so all services behave the same way.

## One workflow for every service (identical everywhere)
- **Dev (author a change):** `npx prisma migrate dev --name <change>` — creates a timestamped
  migration folder under `prisma/migrations/` and applies it locally.
- **CI / staging / prod (apply):** `npx prisma migrate deploy` — applies committed migrations
  only. **Never** `migrate dev` outside local dev.
- **Generate client:** `npx prisma generate` (also runs in the Dockerfile build).
- **Drift check (CI gate):** `npx prisma migrate status` must report no drift / no pending.

These are wired as identical npm scripts in **every** service `package.json`:
```json
{
  "scripts": {
    "db:migrate":  "prisma migrate dev",
    "db:deploy":   "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:status":   "prisma migrate status",
    "db:seed":     "node prisma/seed.js"
  },
  "prisma": { "seed": "node prisma/seed.js" }
}
```

## Migration files are source-controlled artifacts
- **Commit** `prisma/migrations/**` and `prisma/migrations/migration_lock.toml`.
- Migration files are **immutable** once committed/applied — never hand-edit an applied
  migration. To change schema, create a **new** migration.
- Migration naming: short, descriptive, kebab/snake — `add-wallet-balance`, `add-refresh-token-table`.

## Apply on deploy, never implicitly on boot (prod)
- Containers run `prisma migrate deploy` as an **explicit step** (entrypoint/job/compose
  command), not silently inside `server.js`.
```yaml
# docker-compose.yml (per service) — explicit migrate step
command: sh -c "npx prisma migrate deploy && node src/server.js"
```

## Keeping schemas consistent across services
- Each service defines only the tables **it owns**. Shared concepts (e.g. a `userId`) are
  stored as plain references/ids, **not** cross-database foreign keys.
- Common conventions are kept identical in every schema:
  - PKs: `id String @id @default(uuid())` (or cuid) — pick one and use it everywhere.
  - Timestamps on every table: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`.
  - Soft-delete convention (if used): `deletedAt DateTime?` — applied uniformly.
  - Snake_case table names via `@@map`, camelCase fields.
- When a contract that crosses services changes (e.g. token shape, role enum values), bump it
  in lockstep: a migration in each affected service in the **same PR/release**, and note it
  in each service README.

## Seed
- `prisma/seed.js` per service, idempotent (`upsert`), free/local data only (default roles,
  a dev admin, sample wallet). Safe to re-run.

## DO / DON'T
| DO | DON'T |
|----|-------|
| commit every migration + `migration_lock.toml` | edit an applied migration in place |
| `migrate deploy` in CI/prod | `migrate dev` or `db push` in prod |
| same npm scripts in all services | ad-hoc per-repo migration commands |
| store cross-service ids as plain references | cross-database foreign keys |
| run `migrate status` as a CI drift gate | ignore drift / apply on boot silently |

## Self-check addition
- [ ] Migration committed for every schema change; no drift (`migrate status` clean).
- [ ] No `migrate dev` / `db push` in non-dev environments.
- [ ] Same `db:*` scripts and conventions present in this service as all others.
