import { Router } from 'express';
import { ipTracker, rateLimiter, auth, validate, encryption } from '../../../shared/middleware/index.js';
import {
  transactionDepositConstant,
  transactionWithdrawConstant,
  transactionListConstant,
  transactionGetConstant,
} from '../constants/index.js';
import {
  transactionDepositValidator,
  transactionWithdrawValidator,
  transactionListValidator,
  transactionGetValidator,
} from '../validators/index.js';
import {
  transactionDepositController,
  transactionWithdrawController,
  transactionListController,
  transactionGetController,
} from '../controllers/index.js';

const router = Router();

router.post(
  transactionDepositConstant.ROUTE,
  ipTracker,
  rateLimiter(transactionDepositConstant.RATE_LIMIT),
  auth,
  encryption,
  validate(transactionDepositValidator),
  transactionDepositController,
);

router.post(
  transactionWithdrawConstant.ROUTE,
  ipTracker,
  rateLimiter(transactionWithdrawConstant.RATE_LIMIT),
  auth,
  encryption,
  validate(transactionWithdrawValidator),
  transactionWithdrawController,
);

router.get(
  transactionListConstant.ROUTE,
  ipTracker,
  rateLimiter(transactionListConstant.RATE_LIMIT),
  auth,
  validate(transactionListValidator),
  transactionListController,
);

router.get(
  transactionGetConstant.ROUTE,
  ipTracker,
  rateLimiter(transactionGetConstant.RATE_LIMIT),
  auth,
  validate(transactionGetValidator),
  transactionGetController,
);

export { router as transactionRoutes };
