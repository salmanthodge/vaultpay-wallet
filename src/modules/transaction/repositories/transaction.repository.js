import { Prisma } from '@prisma/client';
import { prisma } from '../../../shared/config/database.js';

/**
 * Transaction module repository — the ONLY Prisma site for the ledger.
 * Balance arithmetic is atomic: each credit/debit runs inside prisma.$transaction
 * and writes both the wallet balance and the ledger row together. Debits use a
 * conditional update (status ACTIVE AND balance >= amount) so balances can never
 * go negative under concurrency — returns null when the guard fails.
 */
export const transactionRepository = {
  findById: (id) => prisma.transaction.findUnique({ where: { id }, include: { wallet: true } }),
  findByReference: (reference) =>
    prisma.transaction.findUnique({ where: { reference }, include: { wallet: true } }),
  listByWallet: (walletId, { skip, take }) =>
    prisma.transaction.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
  countByWallet: (walletId) => prisma.transaction.count({ where: { walletId } }),

  credit: (walletId, amount, { reference = null, description = null, transferId = null } = {}) =>
    prisma.$transaction(async (tx) => {
      const dec = new Prisma.Decimal(amount);
      await tx.wallet.update({ where: { id: walletId }, data: { balance: { increment: dec } } });
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      const transaction = await tx.transaction.create({
        data: {
          walletId,
          type: 'CREDIT',
          amount: dec,
          balanceAfter: wallet.balance,
          reference,
          description,
          transferId,
        },
      });
      return { transaction, wallet };
    }),

  debit: (walletId, amount, { reference = null, description = null, transferId = null } = {}) =>
    prisma.$transaction(async (tx) => {
      const dec = new Prisma.Decimal(amount);
      const guarded = await tx.wallet.updateMany({
        where: { id: walletId, status: 'ACTIVE', balance: { gte: dec } },
        data: { balance: { decrement: dec } },
      });
      if (guarded.count === 0) return null; // insufficient funds or inactive
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      const transaction = await tx.transaction.create({
        data: {
          walletId,
          type: 'DEBIT',
          amount: dec,
          balanceAfter: wallet.balance,
          reference,
          description,
          transferId,
        },
      });
      return { transaction, wallet };
    }),
};
