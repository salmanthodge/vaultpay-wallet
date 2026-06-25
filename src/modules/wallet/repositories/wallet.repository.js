import { prisma } from '../../../shared/config/database.js';

/**
 * Wallet module repository — the ONLY Prisma site for this module (rules/04).
 * Balance-mutating operations (deposit/withdraw/transfer) live in their own
 * modules' repositories; this one handles wallet creation and reads.
 */
export const walletRepository = {
  create: ({ userId, currency }) => prisma.wallet.create({ data: { userId, currency } }),
  findByUserAndCurrency: (userId, currency) =>
    prisma.wallet.findUnique({ where: { userId_currency: { userId, currency } } }),
  findById: (id) => prisma.wallet.findUnique({ where: { id } }),
  listByUser: (userId) =>
    prisma.wallet.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
};
