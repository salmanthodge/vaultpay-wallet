import { transactionRepository } from '../repositories/transaction.repository.js';
import { loadOwnedWallet } from './transaction.access.service.js';
import { getPagination, buildPageMeta } from '../../../shared/utils/pagination.js';

/**
 * Lists a wallet's ledger (paginated). Caller must own the wallet.
 *
 * @param {{ id: string }} params
 * @param {{ page?: number, limit?: number }} query
 * @param {{ userId: string }} context
 */
export const transactionListService = async ({ id }, query, context) => {
  await loadOwnedWallet(id, context.userId);
  const { skip, take, page, limit } = getPagination(query);
  const [transactions, total] = await Promise.all([
    transactionRepository.listByWallet(id, { skip, take }),
    transactionRepository.countByWallet(id),
  ]);
  return { transactions, meta: buildPageMeta({ page, limit, total }) };
};
