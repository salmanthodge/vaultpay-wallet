import { formatAmount } from '../../../shared/utils/money.js';

/** Shape a transaction (ledger) row into the API form. */
export const serializeTransaction = (t) => ({
  id: t.id,
  walletId: t.walletId,
  type: t.type,
  amount: formatAmount(t.amount),
  balanceAfter: formatAmount(t.balanceAfter),
  status: t.status,
  reference: t.reference,
  description: t.description,
  transferId: t.transferId,
  createdAt: t.createdAt,
});
