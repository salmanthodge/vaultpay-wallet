# 01 — Architecture

## Polyrepo + database-per-service
- Each service is its **own git repository**.
- Each service owns its **own PostgreSQL database** and **its own Prisma schema**.
- Services never read another service's database. Cross-service data is obtained via
  HTTP calls authenticated with **S2S JWT**.
- Shared code (middleware, utils, errors) is **duplicated** per service. There is no
  shared npm package and no monorepo workspace.

## Per-service `src/` structure (mandatory)
```
src/
  modules/{module-name}/
    constants/    -> {module}.{endpoint}.constant.js   (one file per endpoint)
    routes/       -> {module}.routes.js                (one file per module)
    controllers/  -> {module}.{endpoint}.controller.js (req/res only, no logic)
    validators/   -> {module}.{endpoint}.validator.js  (zod schemas)
    services/     -> {module}.{endpoint}.service.js    (business logic; NO Prisma)
    repositories/ -> {module}.repository.js            (ONE per module; ONLY place Prisma is used)
    parsers/      -> {module}.{endpoint}.parser.js     (shape DB output -> API shape)
    docs/         -> {module}.{endpoint}.docs.js       (swagger per endpoint)
    types/        -> {module}.types.js                 (JSDoc typedefs)
    index.js      -> barrel; exports the module router
  modules/index.js -> mounts all module routers
  shared/
    config/      -> env, database (Prisma singleton), redis, swagger, logger, cluster
    middleware/  -> auth, rbac, serviceAuth, validate, response, encryption, event,
                    rateLimiter, ipTracker, notFound, errorHandler
    utils/       -> crypto, hash, jwt, date, pagination, file, asyncHandler
    constants/   -> roles, permissions, errorCodes, messages, httpStatus, events
    errors/      -> AppError, ValidationError, AuthError, NotFoundError, ForbiddenError
    events/      -> emitter, handlers/
    services/    -> email, storage, cache, audit
    validators/  -> common.validator.js
    index.js     -> barrel for shared
  jobs/          -> background workers (optional)
  app.js         -> builds & exports Express app (NO listen)
  server.js      -> imports app, sets up cluster, listens
```

## Layer responsibilities (one direction only)
```
route -> controller -> service -> repository -> Prisma
                          |            ^
                          v            |
                       parser <--------+
```
- **routes** wire middleware + controller for each endpoint.
- **controllers** read `req`, call ONE service, send `res`. No logic.
- **services** hold business logic. They call repositories. **No Prisma here.**
- **repositories** are the ONLY place Prisma is imported/used. One per module.
- **parsers** convert DB rows → API response shape.

## DO
- Keep `app.js` free of `listen()`; only `server.js` listens.
- Put every cross-cutting concern in `shared/`.
- Give every folder an `index.js` barrel.

## DON'T
- DON'T import Prisma outside `repositories/`.
- DON'T let a service query another service's DB directly.
- DON'T create a shared package — duplicate instead.

## Example — module barrel (`modules/auth/index.js`)
```js
import { Router } from 'express';
import { authRoutes } from './routes/auth.routes.js';

const router = Router();
router.use('/auth', authRoutes);

export { router as authModule };
```
