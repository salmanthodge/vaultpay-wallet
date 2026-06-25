import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { transactionListService } from '../services/transaction.list.service.js';
import { transactionListParser } from '../parsers/transaction.list.parser.js';

export const transactionListController = asyncHandler(async (req, res) => {
  const result = await transactionListService({ id: req.params.id }, req.query, {
    userId: req.user.id,
  });
  res.success(transactionListParser(result), result.meta);
});
