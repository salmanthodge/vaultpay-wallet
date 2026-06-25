import { transferRepository } from '../repositories/transfer.repository.js';
import { NotFoundError } from '../../../shared/errors/index.js';
import { errorCodes } from '../../../shared/constants/errorCodes.js';
import { messages } from '../../../shared/constants/messages.js';

/**
 * Fetches one transfer the caller is a party to (sender or recipient).
 *
 * @param {{ id: string }} params
 * @param {{ userId: string }} context
 */
export const transferGetService = async ({ id }, context) => {
  const transfer = await transferRepository.findById(id);
  const isParty =
    transfer &&
    (transfer.fromWallet.userId === context.userId || transfer.toWallet.userId === context.userId);
  if (!isParty) {
    throw new NotFoundError(messages[errorCodes.TRANSFER_NOT_FOUND], errorCodes.TRANSFER_NOT_FOUND);
  }
  return { transfer };
};
