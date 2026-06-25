# 03 — Request Flow

## Mandatory pipeline
```
routes
  -> [ ipTracker, rateLimiter, auth, rbac, encryption(decrypt), validate ]
  -> controller        (req/res only)
  -> service           (business logic, no Prisma)
  -> repository        (ONLY place Prisma runs)
  -> parser            (DB shape -> API shape)
  -> response.middleware (encrypt if enabled, standard envelope)
  -> errorHandler      (centralized)
```

Middleware order is fixed. Skip a middleware only when it does not apply (e.g. public
`login` has no `auth`/`rbac`), never reorder.

## REST contract per endpoint
- Correct method + status code:
  - `POST` create → `201`, `GET` → `200`, `PUT/PATCH` → `200`, `DELETE` → `204`.
  - Validation fail → `422` (or `400`), auth fail → `401`, forbidden → `403`, missing → `404`,
    conflict → `409`.
- Responses are stateless and return a consistent envelope (see `response` middleware).

## Standard response envelope
```json
{ "success": true, "data": { }, "meta": { }, "error": null }
```
Errors (set by `errorHandler`):
```json
{ "success": false, "data": null, "error": { "code": "AUTH_INVALID_CREDENTIALS", "message": "..." } }
```

## DO / DON'T
- **DO** wrap every controller in `asyncHandler` so rejected promises reach `errorHandler`.
- **DO** call exactly one service from a controller.
- **DON'T** send `res` from a service or repository.
- **DON'T** put try/catch business branching in controllers — throw typed errors in services.

## Example — route wiring (`modules/auth/routes/auth.routes.js`)
```js
import { Router } from 'express';
import { ipTracker } from '../../../shared/middleware/ipTracker.js';
import { rateLimiter } from '../../../shared/middleware/rateLimiter.js';
import { validate } from '../../../shared/middleware/validate.js';
import { loginValidator } from '../validators/auth.login.validator.js';
import { loginController } from '../controllers/auth.login.controller.js';

const router = Router();

router.post(
  '/login',
  ipTracker,
  rateLimiter({ key: 'auth:login', max: 5, windowSec: 60 }),
  validate(loginValidator),
  loginController,
);

export { router as authRoutes };
```

## Example — controller (`auth.login.controller.js`)
```js
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { loginService } from '../services/auth.login.service.js';
import { loginParser } from '../parsers/auth.login.parser.js';
import { httpStatus } from '../../../shared/constants/httpStatus.js';

export const loginController = asyncHandler(async (req, res) => {
  const result = await loginService(req.body, { ip: req.clientIp });
  res.status(httpStatus.OK).success(loginParser(result));
});
```
