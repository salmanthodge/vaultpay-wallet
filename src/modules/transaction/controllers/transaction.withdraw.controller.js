import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { withdrawService } from '../services/transaction.withdraw.service.js';
import { transactionMovementParser } from '../parsers/transaction.movement.parser.js';

export const transactionWithdrawController = asyncHandler(async (req, res) => {
  const result = await withdrawService({ id: req.params.id }, req.body, { userId: req.user.id });
  res.created(transactionMovementParser(result));
});
