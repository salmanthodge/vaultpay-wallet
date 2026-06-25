import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { transferListService } from '../services/transfer.list.service.js';
import { transferListParser } from '../parsers/transfer.list.parser.js';

export const transferListController = asyncHandler(async (req, res) => {
  const result = await transferListService(req.query, { userId: req.user.id });
  res.success(transferListParser(result), result.meta);
});
