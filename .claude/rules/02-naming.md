# 02 — Naming Conventions

## Files
Pattern: `{module}.{endpoint}.{layer}.js` (lower-kebab for module/endpoint).
- `auth.login.controller.js`, `auth.login.service.js`, `auth.login.validator.js`
- `auth.login.parser.js`, `auth.login.docs.js`, `auth.login.constant.js`
- **One per module** (no endpoint segment): `auth.routes.js`, `auth.repository.js`, `auth.types.js`

Endpoint segment is a verb-ish action name (`login`, `register`, `refresh`, `listWallets`)
but URLs themselves stay RESTful nouns (see below).

## REST URL naming
- Resources are **plural nouns**: `/wallets`, `/documents`, `/transactions`.
- Nesting shows ownership: `/wallets/:walletId/transactions`.
- Actions = HTTP verbs, not URL words.

| DO | DON'T |
|----|-------|
| `POST /wallets` | `POST /createWallet` |
| `GET /wallets/:id` | `GET /getWalletById` |
| `DELETE /documents/:id` | `POST /deleteDocument` |
| `PATCH /wallets/:id` | `POST /updateWallet` |

## Variables & functions
- `camelCase` for variables and functions: `accessToken`, `findUserByEmail`.
- `PascalCase` for classes and error types: `AppError`, `WalletService`.
- `SCREAMING_SNAKE_CASE` for constants and env keys: `ENCRYPTION_ENABLED`, `MAX_LOGIN_ATTEMPTS`.
- Repository methods describe data ops: `create`, `findById`, `findByEmail`, `updateById`, `deleteById`.
- Service methods describe use-cases: `registerUser`, `issueTokens`, `rotateRefreshToken`.

## Exports
- Named exports everywhere (ESM). Avoid `default` except framework requirements.

## DO / DON'T
- **DO** keep file name, the symbol it exports, and the route action consistent.
- **DON'T** mix kebab and camel in file names (`authLogin.controller.js` ❌).
- **DON'T** abbreviate ambiguously (`usrSvc` ❌ → `userService` ✓).

## Example
```js
// file: modules/wallet/services/wallet.create.service.js
import { walletRepository } from '../repositories/wallet.repository.js';

export const createWalletService = async ({ userId, currency }) => {
  return walletRepository.create({ userId, currency });
};
```
