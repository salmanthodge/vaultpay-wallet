import { walletRepository } from '../repositories/wallet.repository.js';
import { NotFoundError } from '../../../shared/errors/index.js';
import { errorCodes } from '../../../shared/constants/errorCodes.js';
import { messages } from '../../../shared/constants/messages.js';

/**
 * Fetches one wallet owned by the authenticated user. Returns 404 (not 403) when
 * the wallet belongs to someone else, to avoid leaking existence.
 *
 * @param {{ id: string }} params
 * @param {{ userId: string }} context
 */
export const walletGetService = async ({ id }, context) => {
  const wallet = await walletRepository.findById(id);
  if (!wallet || wallet.userId !== context.userId) {
    throw new NotFoundError(messages[errorCodes.WALLET_NOT_FOUND], errorCodes.WALLET_NOT_FOUND);
  }
  return { wallet };
};
