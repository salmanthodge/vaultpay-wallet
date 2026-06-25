import { AppError } from './AppError.js';
import { httpStatus } from '../constants/httpStatus.js';
import { errorCodes } from '../constants/errorCodes.js';
import { messages } from '../constants/messages.js';

export class AuthError extends AppError {
  constructor(code = errorCodes.AUTH_TOKEN_INVALID, message, details = null) {
    super(message ?? messages[code] ?? 'Authentication error', httpStatus.UNAUTHORIZED, code, details);
  }
}
