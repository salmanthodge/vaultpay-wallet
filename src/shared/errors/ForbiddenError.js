import { AppError } from './AppError.js';
import { httpStatus } from '../constants/httpStatus.js';
import { errorCodes } from '../constants/errorCodes.js';
import { messages } from '../constants/messages.js';

export class ForbiddenError extends AppError {
  constructor(message = messages[errorCodes.FORBIDDEN], code = errorCodes.FORBIDDEN) {
    super(message, httpStatus.FORBIDDEN, code);
  }
}
