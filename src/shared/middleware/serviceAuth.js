import { verifyServiceToken } from '../utils/jwt.js';
import { AuthError } from '../errors/index.js';
import { errorCodes } from '../constants/errorCodes.js';

/** Service-to-service authentication (rules/05). Verifies a Bearer S2S JWT. */
export const serviceAuth = (req, _res, next) => {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new AuthError(errorCodes.S2S_UNAUTHORIZED);
    }
    let claims;
    try {
      claims = verifyServiceToken(token);
    } catch {
      throw new AuthError(errorCodes.S2S_UNAUTHORIZED);
    }
    req.service = { clientId: claims.sub, scopes: claims.scopes ?? [] };
    return next();
  } catch (err) {
    return next(err);
  }
};
