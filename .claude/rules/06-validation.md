# 06 — Validation (Zod)

## Pattern
- One validator file per endpoint: `{module}.{endpoint}.validator.js`.
- A validator exports a schema describing `body`, `params`, and/or `query`.
- The `validate(schema)` middleware parses `req`, replaces `req.body/params/query` with the
  **parsed (typed, defaulted, stripped) values**, and throws `ValidationError` on failure.
- Reject unknown fields (`.strict()`), normalize (trim, lowercase emails) in the schema.

## Validator example
```js
// modules/auth/validators/auth.login.validator.js
import { z } from 'zod';

export const loginValidator = z.object({
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(8).max(128),
  }).strict(),
});
```

## validate middleware
```js
// shared/middleware/validate.js
import { ValidationError } from '../errors/index.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) {
    return next(new ValidationError(result.error.flatten()));
  }
  if (result.data.body)   req.body   = result.data.body;
  if (result.data.params) req.params = result.data.params;
  if (result.data.query)  req.query  = result.data.query;
  next();
};
```

## Common validators
- Reusable pieces live in `shared/validators/common.validator.js`:
  pagination (`page`, `limit`), `idParam` (uuid/cuid), sort/order.

```js
// shared/validators/common.validator.js
import { z } from 'zod';
export const idParam = z.object({ params: z.object({ id: z.string().uuid() }) });
export const pagination = z.object({
  query: z.object({
    page:  z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});
```

## DO / DON'T
- **DO** validate at the edge (middleware) so services receive trusted input.
- **DO** use `z.coerce` for query strings (they arrive as strings).
- **DON'T** re-validate inside services or repositories.
- **DON'T** allow unknown keys — use `.strict()` on object bodies.
