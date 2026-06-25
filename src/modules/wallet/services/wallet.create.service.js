import { walletRepository } from '../repositories/wallet.repository.js';
import { AppError } from '../../../shared/errors/index.js';
import { httpStatus } from '../../../shared/constants/httpStatus.js';
import { errorCodes } from '../../../shared/constants/errorCodes.js';

/**
 * Creates a wallet for the authenticated user in the given currency.
 * One wallet per (user, currency).
 *
 * @param {{ currency: string }} input
 * @param {{ userId: string }} context
 */
export const walletCreateService = async ({ currency }, context) => {
  const existing = await walletRepository.findByUserAndCurrency(context.userId, currency);
  if (existing) {
    throw new AppError(
      'A wallet for this currency already exists.',
      httpStatus.CONFLICT,
      errorCodes.WALLET_ALREADY_EXISTS,
    );
  }
  const wallet = await walletRepository.create({ userId: context.userId, currency });
  return { wallet };
};
