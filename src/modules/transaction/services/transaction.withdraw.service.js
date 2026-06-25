import { transactionRepository } from '../repositories/transaction.repository.js';
import { loadOwnedWallet } from './transaction.access.service.js';
import { AppError } from '../../../shared/errors/index.js';
import { httpStatus } from '../../../shared/constants/httpStatus.js';
import { errorCodes } from '../../../shared/constants/errorCodes.js';

/**
 * Debits a wallet. Balance is guarded atomically in the repository; idempotent
 * on `reference`.
 *
 * @param {{ id: string }} params
 * @param {{ amount: string, reference?: string, description?: string }} input
 * @param {{ userId: string }} context
 */
export const withdrawService = async ({ id }, { amount, reference, description }, context) => {
  const wallet = await loadOwnedWallet(id, context.userId, { requireActive: true });

  if (reference) {
    const existing = await transactionRepository.findByReference(reference);
    if (existing) {
      return { transaction: existing, wallet: existing.wallet ?? wallet, idempotentReplay: true };
    }
  }

  let result;
  try {
    result = await transactionRepository.debit(wallet.id, amount, { reference, description });
  } catch (err) {
    if (err?.code === 'P2002') {
      throw new AppError(
        'This reference has already been used.',
        httpStatus.CONFLICT,
        errorCodes.DUPLICATE_REFERENCE,
      );
    }
    throw err;
  }

  if (!result) {
    throw new AppError(
      'Insufficient funds.',
      httpStatus.UNPROCESSABLE_ENTITY,
      errorCodes.INSUFFICIENT_FUNDS,
    );
  }
  return { ...result, idempotentReplay: false };
};
