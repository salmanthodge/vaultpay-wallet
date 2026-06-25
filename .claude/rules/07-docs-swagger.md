# 07 — Docs / Swagger

## Convention
- One docs file per endpoint: `{module}.{endpoint}.docs.js`.
- Each exports a fragment of the OpenAPI **paths** object (method + path).
- `shared/config/swagger.js` collects all fragments and serves Swagger UI at `/docs`.
- Docs describe the REST contract: method, path, params, request body, **all status codes**.

## Endpoint docs example
```js
// modules/auth/docs/auth.login.docs.js
export const loginDocs = {
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Authenticate a customer and issue tokens',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email:    { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 8 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Tokens issued' },
        401: { description: 'Invalid credentials' },
        422: { description: 'Validation error' },
        429: { description: 'Too many attempts' },
      },
    },
  },
};
```

## Aggregation
```js
// shared/config/swagger.js (sketch)
import { loginDocs } from '../../modules/auth/docs/auth.login.docs.js';
// ...import every *.docs.js

export const openapiSpec = {
  openapi: '3.0.3',
  info: { title: 'VaultPay Auth Service', version: '1.0.0' },
  paths: { ...loginDocs /*, ...registerDocs, ... */ },
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
};
```

## DO / DON'T
- **DO** add the docs file in the same PR/slice as the endpoint — no undocumented endpoints.
- **DO** document every status code the endpoint can return.
- **DON'T** maintain a single giant swagger file — keep it per-endpoint, aggregated.
- **DON'T** let docs drift from the Zod validator; keep request shapes in sync.
