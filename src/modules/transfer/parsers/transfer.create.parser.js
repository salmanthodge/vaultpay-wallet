import { serializeTransfer } from './transfer.shape.js';
import { formatAmount } from '../../../shared/utils/money.js';

/** Returns the transfer plus the source wallet's new balance (the owned side). */
export const transferCreateParser = (result) => ({
  transfer: serializeTransfer(result.transfer),
  from: { id: result.from.id, balance: formatAmount(result.from.balance) },
  idempotentReplay: Boolean(result.idempotentReplay),
});
