import { transactionRepository } from '../repositories/transaction.repository.js';
import { NotFoundError } from '../../../shared/errors/index.js';
import { errorCodes } from '../../../shared/constants/errorCodes.js';
import { messages } from '../../../shared/constants/messages.js';

/**
 * Fetches one transaction owned (via its wallet) by the caller.
 *
 * @param {{ id: string }} params
 * @param {{ userId: string }} context
 */
export const transactionGetService = async ({ id }, context) => {
  const transaction = await transactionRepository.findById(id);
  if (!transaction || transaction.wallet.userId !== context.userId) {
    throw new NotFoundError(
      messages[errorCodes.TRANSACTION_NOT_FOUND],
      errorCodes.TRANSACTION_NOT_FOUND,
    );
  }
  return { transaction };
};
