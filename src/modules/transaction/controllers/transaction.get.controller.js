import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { transactionGetService } from '../services/transaction.get.service.js';
import { transactionGetParser } from '../parsers/transaction.get.parser.js';

export const transactionGetController = asyncHandler(async (req, res) => {
  const result = await transactionGetService({ id: req.params.id }, { userId: req.user.id });
  res.success(transactionGetParser(result));
});
