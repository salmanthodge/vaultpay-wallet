import { Prisma } from '@prisma/client';
import { prisma } from '../../../shared/config/database.js';

/**
 * Transfer module repository — the ONLY Prisma site here. A transfer moves money
 * across two wallets, so the whole operation runs in ONE prisma.$transaction.
 *
 * Deadlock avoidance: both wallet rows are locked with SELECT ... FOR UPDATE in a
 * DETERMINISTIC order (sorted by id), so concurrent A→B and B→A transfers acquire
 * locks in the same order and can never deadlock. Balance is then re-checked under
 * the lock before debiting.
 */
export const transferRepository = {
  findByReference: (reference) =>
    prisma.transfer.findUnique({ where: { reference }, include: { fromWallet: true, toWallet: true } }),
  findById: (id) =>
    prisma.transfer.findUnique({ where: { id }, include: { fromWallet: true, toWallet: true } }),
  listByUser: (userId, { skip, take }) =>
    prisma.transfer.findMany({
      where: { OR: [{ fromWallet: { userId } }, { toWallet: { userId } }] },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
  countByUser: (userId) =>
    prisma.transfer.count({
      where: { OR: [{ fromWallet: { userId } }, { toWallet: { userId } }] },
    }),

  /**
   * @returns {{ ok: true, transfer, from, to } | { ok: false, reason: string }}
   */
  executeTransfer: (fromWalletId, toWalletId, amount, { reference = null, description = null } = {}) =>
    prisma.$transaction(async (tx) => {
      const dec = new Prisma.Decimal(amount);

      // 1. lock both wallet rows in a deterministic order (deadlock-free)
      const [firstId, secondId] = [fromWalletId, toWalletId].sort();
      await tx.$queryRaw`SELECT id FROM wallets WHERE id = ${firstId}::uuid FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM wallets WHERE id = ${secondId}::uuid FOR UPDATE`;

      // 2. re-read under lock and validate
      const from = await tx.wallet.findUnique({ where: { id: fromWalletId } });
      const to = await tx.wallet.findUnique({ where: { id: toWalletId } });
      if (!from || !to) return { ok: false, reason: 'NOT_FOUND' };
      if (from.status !== 'ACTIVE' || to.status !== 'ACTIVE') return { ok: false, reason: 'INACTIVE' };
      if (from.currency !== to.currency) return { ok: false, reason: 'CURRENCY' };
      if (from.balance.lessThan(dec)) return { ok: false, reason: 'INSUFFICIENT' };

      // 3. record the transfer + both ledger legs
      const transfer = await tx.transfer.create({
        data: {
          fromWalletId,
          toWalletId,
          amount: dec,
          currency: from.currency,
          status: 'COMPLETED',
          reference,
          description,
          completedAt: new Date(),
        },
      });

      const updatedFrom = await tx.wallet.update({
        where: { id: fromWalletId },
        data: { balance: { decrement: dec } },
      });
      await tx.transaction.create({
        data: {
          walletId: fromWalletId,
          type: 'DEBIT',
          amount: dec,
          balanceAfter: updatedFrom.balance,
          transferId: transfer.id,
          description,
        },
      });

      const updatedTo = await tx.wallet.update({
        where: { id: toWalletId },
        data: { balance: { increment: dec } },
      });
      await tx.transaction.create({
        data: {
          walletId: toWalletId,
          type: 'CREDIT',
          amount: dec,
          balanceAfter: updatedTo.balance,
          transferId: transfer.id,
          description,
        },
      });

      return { ok: true, transfer, from: updatedFrom, to: updatedTo };
    }),
};
