import { AppError } from './AppError.js';
import { httpStatus } from '../constants/httpStatus.js';
import { errorCodes } from '../constants/errorCodes.js';
import { messages } from '../constants/messages.js';

export class NotFoundError extends AppError {
  constructor(message = messages[errorCodes.NOT_FOUND], code = errorCodes.NOT_FOUND) {
    super(message, httpStatus.NOT_FOUND, code);
  }
}
