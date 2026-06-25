import { formatAmount } from '../../../shared/utils/money.js';

/** Shape a transfer row into the API form. */
export const serializeTransfer = (t) => ({
  id: t.id,
  fromWalletId: t.fromWalletId,
  toWalletId: t.toWalletId,
  amount: formatAmount(t.amount),
  currency: t.currency,
  status: t.status,
  reference: t.reference,
  description: t.description,
  createdAt: t.createdAt,
  completedAt: t.completedAt,
});
