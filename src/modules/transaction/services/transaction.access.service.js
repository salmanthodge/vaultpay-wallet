import { walletRepository } from '../../wallet/repositories/wallet.repository.js';
import { AppError, NotFoundError } from '../../../shared/errors/index.js';
import { httpStatus } from '../../../shared/constants/httpStatus.js';
import { errorCodes } from '../../../shared/constants/errorCodes.js';
import { messages } from '../../../shared/constants/messages.js';

/**
 * Internal helper: load a wallet that belongs to the user, optionally requiring
 * it to be ACTIVE. 404s (not 403s) on non-ownership to avoid leaking existence.
 *
 * @param {string} walletId
 * @param {string} userId
 * @param {{ requireActive?: boolean }} [opts]
 */
export const loadOwnedWallet = async (walletId, userId, { requireActive = false } = {}) => {
  const wallet = await walletRepository.findById(walletId);
  if (!wallet || wallet.userId !== userId) {
    throw new NotFoundError(messages[errorCodes.WALLET_NOT_FOUND], errorCodes.WALLET_NOT_FOUND);
  }
  if (requireActive && wallet.status !== 'ACTIVE') {
    throw new AppError(
      messages[errorCodes.WALLET_INACTIVE],
      httpStatus.CONFLICT,
      errorCodes.WALLET_INACTIVE,
    );
  }
  return wallet;
};
