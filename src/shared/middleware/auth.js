import { verifyAccessToken } from '../utils/jwt.js';
import { AuthError } from '../errors/index.js';
import { errorCodes } from '../constants/errorCodes.js';

/**
 * Customer JWT authentication (rules/05). Stateless: verifies the Bearer access
 * token's signature/expiry with the shared secret and attaches req.user.
 * Token revocation (logout deny-list) is enforced at the auth-service; access
 * tokens here are short-lived and trusted until expiry.
 */
export const auth = (req, _res, next) => {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new AuthError(errorCodes.AUTH_TOKEN_MISSING);
    }
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      throw new AuthError(
        err.name === 'TokenExpiredError'
          ? errorCodes.AUTH_TOKEN_EXPIRED
          : errorCodes.AUTH_TOKEN_INVALID,
      );
    }
    req.user = {
      id: payload.sub,
      role: payload.role,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
    };
    return next();
  } catch (err) {
    return next(err);
  }
};
