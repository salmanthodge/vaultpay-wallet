# 09 — Workflow (how Claude must operate)

## Golden rule
**Plan → Confirm → Build, gate by gate.** Rules first, code second. The `rules/` folder is
the source of truth. When something is not covered by a rule, **ASK** — never improvise.

## Phases
- **Phase 0 — Rules:** create/maintain `rules/`. No feature code until approved.
- **Phase 1 — Plan (per service):**
  1. State which service (start with **auth-service**).
  2. List modules + endpoints.
  3. Propose the Prisma schema (this service only).
  4. Give an ordered build checklist.
  Then **[CONFIRM]** and STOP.
- **Phase 2 — Build (one slice at a time):**
  1. Repo skeleton (`package.json`, ignores, `.env.example`, Dockerfile, compose, eslint/prettier).
  2. `shared/config/` (env, database, redis, logger).
  3. `shared/` core (errors, constants, utils, middleware) — only what module 1 needs.
  4. Prisma schema + first migration + seed.
  5. First module end-to-end (every layer, exact request flow).
  6. Remaining modules, one at a time.
  7. `app.js` + `server.js` (cluster) + swagger wiring.
  8. Service README.
  STOP at each numbered step's **[CONFIRM]**.
- **Phase 3 — Next service:** repeat Phase 1+2 for wallet → vault → admin, then the
  **gateway** (config + middleware + proxy + S2S signing, no modules).

## At every gate
- Build ONE slice, then STOP.
- Summarize **what** you created and **why**.
- Run the **self-check** (below) and report results.
- End the message with exactly: **"Awaiting your confirmation to proceed."**

## Self-check (run after each build step)
- [ ] Prisma imported ONLY in `repositories/`.
- [ ] Controllers have no business logic; services have no Prisma.
- [ ] Request flow respected (ipTracker → rateLimiter → auth → rbac → encryption(decrypt) → validate → controller → service → repo → parser → response → errorHandler).
- [ ] Every folder has an `index.js` barrel.
- [ ] Naming matches `02-naming.md`; URLs are RESTful.
- [ ] Validation present for every input; docs present for every endpoint.
- [ ] Migration committed for every schema change; `migrate status` clean; same `db:*` scripts as other services (see `10-database-migrations.md`).
- [ ] `ENCRYPTION_ENABLED` respected; no secrets committed.

## DO / DON'T
- **DO** ask when unsure; **DO** keep everything free and local.
- **DON'T** dump the whole project at once.
- **DON'T** proceed past a `[CONFIRM]` gate without explicit approval.
- **DON'T** substitute the fixed tech stack or architecture.
