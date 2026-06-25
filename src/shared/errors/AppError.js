import { httpStatus } from '../constants/httpStatus.js';
import { errorCodes } from '../constants/errorCodes.js';

/** Base application error (rules/04). Services throw subclasses; never raw strings. */
export class AppError extends Error {
  constructor(
    message,
    statusCode = httpStatus.INTERNAL_SERVER_ERROR,
    code = errorCodes.INTERNAL_ERROR,
    details = null,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
