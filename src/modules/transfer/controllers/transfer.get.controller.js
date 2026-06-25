import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { transferGetService } from '../services/transfer.get.service.js';
import { transferGetParser } from '../parsers/transfer.get.parser.js';

export const transferGetController = asyncHandler(async (req, res) => {
  const result = await transferGetService({ id: req.params.id }, { userId: req.user.id });
  res.success(transferGetParser(result));
});
