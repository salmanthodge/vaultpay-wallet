import { walletRepository } from '../repositories/wallet.repository.js';

/**
 * Lists the authenticated user's wallets.
 *
 * @param {{ userId: string }} context
 */
export const walletListService = async (context) => {
  const wallets = await walletRepository.listByUser(context.userId);
  return { wallets };
};
