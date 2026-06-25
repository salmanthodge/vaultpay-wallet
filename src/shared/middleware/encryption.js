import { env } from '../config/env.js';
import { decrypt } from '../utils/crypto.js';
import { AppError } from '../errors/index.js';
import { httpStatus } from '../constants/httpStatus.js';
import { errorCodes } from '../constants/errorCodes.js';

/** Inbound decryption, pass-through unless ENCRYPTION_ENABLED (rules/05). */
export const encryption = (req, _res, next) => {
  if (!env.ENCRYPTION_ENABLED) return next();
  const encrypted = req.body?.encrypted;
  if (!encrypted) return next();
  try {
    req.body = JSON.parse(decrypt(encrypted));
    return next();
  } catch {
    return next(
      new AppError(
        'Failed to decrypt request payload',
        httpStatus.BAD_REQUEST,
        errorCodes.ENCRYPTION_ERROR,
      ),
    );
  }
};
