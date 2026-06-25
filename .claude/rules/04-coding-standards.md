# 04 — Coding Standards

## ESM
- `"type": "module"` in every `package.json`.
- Always use **explicit `.js` extensions** in relative imports.
- Named exports only (no default exports unless a library forces it).

## Barrels
- Every folder has an `index.js` re-exporting its public members.
- Import from the barrel, not deep paths, when crossing a folder boundary.

```js
// shared/errors/index.js
export { AppError } from './AppError.js';
export { ValidationError } from './ValidationError.js';
export { AuthError } from './AuthError.js';
export { NotFoundError } from './NotFoundError.js';
export { ForbiddenError } from './ForbiddenError.js';
```

## Error handling
- Throw **typed errors** (subclasses of `AppError`) from services. Never throw raw strings.
- One central `errorHandler` middleware maps errors → HTTP response. Controllers never format errors.
- Use error **codes** from `shared/constants/errorCodes.js`; messages from `shared/constants/messages.js`.

```js
// service
import { AuthError } from '../../../shared/errors/index.js';
import { errorCodes } from '../../../shared/constants/errorCodes.js';

if (!match) throw new AuthError(errorCodes.AUTH_INVALID_CREDENTIALS);
```

## Async patterns
- `async/await` only. No `.then()` chains in app code.
- Wrap controllers in `asyncHandler`; never leave a floating promise.
- No `await` inside loops when a batched query is possible — push to the repository.

## The hard rules (enforced in self-checks)
- **Prisma is imported ONLY inside `repositories/`.** Services/controllers/parsers must not import `@prisma/client` or the db singleton.
- Controllers contain **no business logic**.
- Services contain **no Prisma**.
- Every folder has a barrel `index.js`.
- Encryption middleware is toggled by `ENCRYPTION_ENABLED`.

## DO / DON'T
| DO | DON'T |
|----|-------|
| `import { x } from './x.js'` | `import { x } from './x'` (no ext) |
| throw `new NotFoundError(...)` | `throw 'not found'` |
| keep functions small + single-purpose | god functions mixing layers |
| log via `shared/config/logger` | `console.log` in app code |

## Example — repository (only Prisma site)
```js
// modules/auth/repositories/auth.repository.js
import { prisma } from '../../../shared/config/database.js';

export const authRepository = {
  findByEmail: (email) => prisma.user.findUnique({ where: { email } }),
  create: (data) => prisma.user.create({ data }),
};
```
