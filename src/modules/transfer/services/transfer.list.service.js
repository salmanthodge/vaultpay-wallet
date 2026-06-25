import { transferRepository } from '../repositories/transfer.repository.js';
import { getPagination, buildPageMeta } from '../../../shared/utils/pagination.js';

/**
 * Lists transfers where the caller is the sender or recipient (paginated).
 *
 * @param {{ page?: number, limit?: number }} query
 * @param {{ userId: string }} context
 */
export const transferListService = async (query, context) => {
  const { skip, take, page, limit } = getPagination(query);
  const [transfers, total] = await Promise.all([
    transferRepository.listByUser(context.userId, { skip, take }),
    transferRepository.countByUser(context.userId),
  ]);
  return { transfers, meta: buildPageMeta({ page, limit, total }) };
};
