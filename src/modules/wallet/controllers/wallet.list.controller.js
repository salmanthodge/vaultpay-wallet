import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { walletListService } from '../services/wallet.list.service.js';
import { walletListParser } from '../parsers/wallet.list.parser.js';

export const walletListController = asyncHandler(async (req, res) => {
  const result = await walletListService({ userId: req.user.id });
  res.success(walletListParser(result));
});
