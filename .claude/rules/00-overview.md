# 00 — Project Overview

## What is VaultPay
VaultPay is a secure digital **wallet** and **document vault** platform. It is built as
**polyrepo microservices**: each service lives in its own repository, owns its own
database, and duplicates shared code (no shared npm package).

## Services
| Repo | Responsibility |
|------|----------------|
| `vaultpay-gateway`  | Single public entry point. Routing/proxy, S2S JWT signing. No business modules. |
| `vaultpay-auth`     | Customer auth (JWT access+refresh), admin sessions, S2S tokens, RBAC source. |
| `vaultpay-wallet`   | Wallets, balances, transactions, transfers. |
| `vaultpay-vault`    | Encrypted document storage (local FS / MinIO), metadata. |
| `vaultpay-admin`    | Admin/back-office operations (session-based auth). |

## Tech Stack (fixed — never substitute)
- **Runtime:** Node.js + Express, ESM (`"type": "module"`)
- **Language:** JavaScript
- **DB:** PostgreSQL · **ORM:** Prisma (database-per-service)
- **Cache / sessions / rate-limit:** Redis
- **Validation:** Zod
- **Auth:** JWT (customer), session (admin), S2S JWT (between services)
- **Free & local only:** files = local FS / MinIO · email = Nodemailer + Mailtrap · geo-IP = geoip-lite
- **Containers:** Docker + Docker Compose

## REST Principle (applies to every endpoint)
The API is **resource-oriented**. See `03-request-flow.md` and `02-naming.md`.
- Nouns for resources (`/wallets`, `/documents`), not verbs (`/getWallet`).
- Use HTTP methods for actions: `GET` read, `POST` create, `PUT/PATCH` update, `DELETE` remove.
- Use correct status codes (`200/201/204/400/401/403/404/409/422/500`).
- Stateless requests: every request carries its own auth; no server-side request affinity.

## How we work — Phase / Gate workflow
Work proceeds in phases. At every **[CONFIRM]** gate, STOP and wait for explicit approval.

- **Phase 0** — write the `rules/` folder. (you are here)
- **Phase 1** — plan a service (modules, endpoints, Prisma schema, build checklist).
- **Phase 2** — build the service one slice at a time, confirming after each step.
- **Phase 3** — repeat for the next service, gateway last.

> Rules first, code second. The `rules/` folder is the **source of truth**. When something
> is not covered by a rule, ASK — do not improvise. See `09-workflow.md`.
