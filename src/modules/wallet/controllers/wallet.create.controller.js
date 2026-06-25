import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { walletCreateService } from '../services/wallet.create.service.js';
import { walletCreateParser } from '../parsers/wallet.create.parser.js';

export const walletCreateController = asyncHandler(async (req, res) => {
  const result = await walletCreateService(req.body, { userId: req.user.id });
  res.created(walletCreateParser(result));
});
