import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { depositService } from '../services/transaction.deposit.service.js';
import { transactionMovementParser } from '../parsers/transaction.movement.parser.js';

export const transactionDepositController = asyncHandler(async (req, res) => {
  const result = await depositService({ id: req.params.id }, req.body, { userId: req.user.id });
  res.created(transactionMovementParser(result));
});
