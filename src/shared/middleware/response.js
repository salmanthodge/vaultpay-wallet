import { httpStatus } from '../constants/httpStatus.js';
import { env } from '../config/env.js';
import { encrypt } from '../utils/crypto.js';

/** Standard response envelope helpers; encrypts data when ENCRYPTION_ENABLED (rules/03). */
const send = (res, status, data, meta) => {
  const base = { success: true, error: null };
  if (meta !== null && meta !== undefined) base.meta = meta;
  if (env.ENCRYPTION_ENABLED && data !== null && data !== undefined) {
    return res.status(status).json({ ...base, data: null, encrypted: encrypt(JSON.stringify(data)) });
  }
  return res.status(status).json({ ...base, data: data ?? null });
};

export const response = (req, res, next) => {
  res.success = (data = null, meta = null, status = httpStatus.OK) => send(res, status, data, meta);
  res.created = (data = null, meta = null) => send(res, httpStatus.CREATED, data, meta);
  res.noContent = () => res.status(httpStatus.NO_CONTENT).send();
  next();
};
