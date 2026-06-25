import { AppError } from '../errors/index.js';
import { httpStatus } from '../constants/httpStatus.js';
import { errorCodes } from '../constants/errorCodes.js';
import { messages } from '../constants/messages.js';
import { logger } from '../config/logger.js';
import { isProduction } from '../config/env.js';

/** Centralized error handler (rules/03) — the only place errors become responses. */
export const errorHandler = (err, req, res, _next) => {
  const isApp = err instanceof AppError;
  const statusCode = isApp ? err.statusCode : httpStatus.INTERNAL_SERVER_ERROR;
  const code = isApp ? err.code : errorCodes.INTERNAL_ERROR;
  const message = isApp ? err.message : messages[errorCodes.INTERNAL_ERROR];

  if (statusCode >= 500) {
    logger.error({ err: err.message, stack: err.stack, code, path: req.originalUrl }, 'request failed');
  } else {
    logger.warn({ code, message, path: req.originalUrl }, 'request error');
  }

  const error = { code, message };
  if (isApp && err.details) error.details = err.details;
  if (!isProduction && statusCode >= 500) error.stack = err.stack;

  return res.status(statusCode).json({ success: false, data: null, error });
};
