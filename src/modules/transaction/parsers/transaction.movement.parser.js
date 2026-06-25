import { serializeTransaction } from './transaction.shape.js';
import { formatAmount } from '../../../shared/utils/money.js';

/** Used by deposit + withdraw: the ledger entry plus the resulting balance. */
export const transactionMovementParser = (result) => ({
  transaction: serializeTransaction(result.transaction),
  wallet: { id: result.wallet.id, balance: formatAmount(result.wallet.balance) },
  idempotentReplay: Boolean(result.idempotentReplay),
});
