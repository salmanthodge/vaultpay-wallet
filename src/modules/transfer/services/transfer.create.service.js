import { transferRepository } from '../repositories/transfer.repository.js';
import { walletRepository } from '../../wallet/repositories/wallet.repository.js';
import { AppError, NotFoundError } from '../../../shared/errors/index.js';
import { httpStatus } from '../../../shared/constants/httpStatus.js';
import { errorCodes } from '../../../shared/constants/errorCodes.js';
import { messages } from '../../../shared/constants/messages.js';

const REASON_TO_ERROR = {
  NOT_FOUND: { status: httpStatus.NOT_FOUND, code: errorCodes.WALLET_NOT_FOUND },
  INACTIVE: { status: httpStatus.CONFLICT, code: errorCodes.WALLET_INACTIVE },
  CURRENCY: { status: httpStatus.CONFLICT, code: errorCodes.WALLET_CURRENCY_MISMATCH },
  INSUFFICIENT: { status: httpStatus.UNPROCESSABLE_ENTITY, code: errorCodes.INSUFFICIENT_FUNDS },
};

/**
 * Transfers funds between two wallets. The source must belong to the caller; the
 * destination may belong to anyone. Atomic + deadlock-safe in the repository.
 * Idempotent on `reference`.
 *
 * @param {{ fromWalletId: string, toWalletId: string, amount: string, reference?: string, description?: string }} input
 * @param {{ userId: string }} context
 */
export const transferCreateService = async (
  { fromWalletId, toWalletId, amount, reference, description },
  context,
) => {
  if (fromWalletId === toWalletId) {
    throw new AppError(
      messages[errorCodes.TRANSFER_SAME_WALLET],
      httpStatus.UNPROCESSABLE_ENTITY,
      errorCodes.TRANSFER_SAME_WALLET,
    );
  }

  // source must be owned by the caller
  const source = await walletRepository.findById(fromWalletId);
  if (!source || source.userId !== context.userId) {
    throw new NotFoundError(messages[errorCodes.WALLET_NOT_FOUND], errorCodes.WALLET_NOT_FOUND);
  }
  // destination must exist (may belong to anyone)
  const destination = await walletRepository.findById(toWalletId);
  if (!destination) {
    throw new NotFoundError(messages[errorCodes.WALLET_NOT_FOUND], errorCodes.WALLET_NOT_FOUND);
  }

  // idempotent replay
  if (reference) {
    const existing = await transferRepository.findByReference(reference);
    if (existing) {
      return { transfer: existing, from: existing.fromWallet, idempotentReplay: true };
    }
  }

  let result;
  try {
    result = await transferRepository.executeTransfer(fromWalletId, toWalletId, amount, {
      reference,
      description,
    });
  } catch (err) {
    if (err?.code === 'P2002') {
      throw new AppError(
        'This reference has already been used.',
        httpStatus.CONFLICT,
        errorCodes.DUPLICATE_REFERENCE,
      );
    }
    throw err;
  }

  if (!result.ok) {
    const mapped = REASON_TO_ERROR[result.reason] ?? {
      status: httpStatus.UNPROCESSABLE_ENTITY,
      code: errorCodes.VALIDATION_ERROR,
    };
    throw new AppError(messages[mapped.code] ?? 'Transfer failed', mapped.status, mapped.code);
  }

  return { transfer: result.transfer, from: result.from, idempotentReplay: false };
};
