import { errorCodes } from './errorCodes.js';

export const messages = Object.freeze({
  [errorCodes.INTERNAL_ERROR]: 'An unexpected error occurred.',
  [errorCodes.VALIDATION_ERROR]: 'Request validation failed.',
  [errorCodes.NOT_FOUND]: 'Resource not found.',
  [errorCodes.CONFLICT]: 'Resource conflict.',
  [errorCodes.FORBIDDEN]: 'You do not have permission to perform this action.',
  [errorCodes.RATE_LIMITED]: 'Too many requests. Please try again later.',
  [errorCodes.ENCRYPTION_ERROR]: 'Failed to process encrypted payload.',

  [errorCodes.AUTH_TOKEN_MISSING]: 'Authentication token is missing.',
  [errorCodes.AUTH_TOKEN_INVALID]: 'Authentication token is invalid.',
  [errorCodes.AUTH_TOKEN_EXPIRED]: 'Authentication token has expired.',

  [errorCodes.S2S_UNAUTHORIZED]: 'Service-to-service authentication failed.',

  [errorCodes.WALLET_NOT_FOUND]: 'Wallet not found.',
  [errorCodes.WALLET_ALREADY_EXISTS]: 'A wallet for this currency already exists.',
  [errorCodes.WALLET_INACTIVE]: 'This wallet is not active.',
  [errorCodes.WALLET_CURRENCY_MISMATCH]: 'Wallet currencies do not match.',
  [errorCodes.INSUFFICIENT_FUNDS]: 'Insufficient funds.',
  [errorCodes.INVALID_AMOUNT]: 'Invalid amount.',
  [errorCodes.DUPLICATE_REFERENCE]: 'This reference has already been used.',
  [errorCodes.TRANSFER_SAME_WALLET]: 'Cannot transfer to the same wallet.',
  [errorCodes.TRANSACTION_NOT_FOUND]: 'Transaction not found.',
  [errorCodes.TRANSFER_NOT_FOUND]: 'Transfer not found.',
});
