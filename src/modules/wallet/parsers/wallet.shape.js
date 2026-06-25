import { formatAmount } from '../../../shared/utils/money.js';

/** Shape a wallet row into the API form (balance as a string). */
export const serializeWallet = (w) => ({
  id: w.id,
  userId: w.userId,
  currency: w.currency,
  balance: formatAmount(w.balance),
  status: w.status,
  createdAt: w.createdAt,
  updatedAt: w.updatedAt,
});
