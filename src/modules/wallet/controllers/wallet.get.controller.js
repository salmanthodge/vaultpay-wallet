import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { walletGetService } from '../services/wallet.get.service.js';
import { walletGetParser } from '../parsers/wallet.get.parser.js';

export const walletGetController = asyncHandler(async (req, res) => {
  const result = await walletGetService({ id: req.params.id }, { userId: req.user.id });
  res.success(walletGetParser(result));
});
