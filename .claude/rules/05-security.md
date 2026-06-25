# 05 — Security

## Authentication models
- **Customer:** JWT **access** (short-lived, ~15m) + **refresh** (long-lived, rotated).
  Refresh tokens stored/blacklisted in Redis. `auth` middleware verifies access token.
- **Admin:** **session-based** (session id in Redis, httpOnly secure cookie).
- **Service-to-service (S2S):** short-lived JWT signed by the gateway/issuer with a
  service key; verified by `serviceAuth` middleware on the receiving service.

```js
// shared/utils/jwt.js (sketch)
export const signAccess  = (payload) => jwt.sign(payload, env.JWT_ACCESS_SECRET,  { expiresIn: '15m' });
export const signRefresh = (payload) => jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
export const signService = (payload) => jwt.sign(payload, env.S2S_SECRET,         { expiresIn: '60s' });
```

## RBAC
- Roles in `shared/constants/roles.js`, permissions in `shared/constants/permissions.js`.
- `rbac(...permissions)` middleware runs AFTER `auth`, checks `req.user.role`/permissions.
- Default deny. No endpoint is protected by route obscurity alone.

```js
router.delete('/documents/:id', auth, rbac(permissions.DOCUMENT_DELETE), validate(idParam), deleteDocController);
```

## Encryption toggle
- `encryption` middleware decrypts inbound payloads and the `response` middleware encrypts
  outbound — **only when `ENCRYPTION_ENABLED=true`**. When false, both are pass-through.
- Crypto lives in `shared/utils/crypto.js` (AES-GCM). Keys come from env, never hardcoded.

## Rate limiting & IP tracking
- `rateLimiter` uses Redis (fixed/sliding window). Tighten on auth endpoints (e.g. 5/min).
- `ipTracker` resolves client IP (respecting proxy headers from the gateway) + geo via
  `geoip-lite`, attaches `req.clientIp` / `req.geo`, and feeds the audit service.

## Passwords & secrets
- Hash passwords with bcrypt/argon2 in `shared/utils/hash.js`. Never store plaintext.
- Secrets only via env (`shared/config/env.js`), validated at boot. Never commit `.env`.

## VAPT / hardening checklist
- `helmet`, CORS allowlist, body size limits, no stack traces to clients in prod.
- Validate **everything** with Zod (`06-validation.md`); reject unknown fields.
- Audit sensitive actions via `shared/services/audit.js`.
- Parameterized queries only (Prisma) — no raw string SQL.

## DO / DON'T
- **DO** default-deny in RBAC and verify tokens on every request (stateless).
- **DO** rotate + blacklist refresh tokens in Redis on use/logout.
- **DON'T** log secrets, tokens, passwords, or full PANs.
- **DON'T** trust client-supplied IP/role; derive from verified token + gateway headers.
