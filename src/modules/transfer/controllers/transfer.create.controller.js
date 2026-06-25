import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { transferCreateService } from '../services/transfer.create.service.js';
import { transferCreateParser } from '../parsers/transfer.create.parser.js';

export const transferCreateController = asyncHandler(async (req, res) => {
  const result = await transferCreateService(req.body, { userId: req.user.id });
  res.created(transferCreateParser(result));
});
