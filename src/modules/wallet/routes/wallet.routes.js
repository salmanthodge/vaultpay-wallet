import { Router } from 'express';
import { ipTracker, rateLimiter, auth, validate, encryption } from '../../../shared/middleware/index.js';
import { walletCreateConstant, walletListConstant, walletGetConstant } from '../constants/index.js';
import { walletCreateValidator, walletGetValidator } from '../validators/index.js';
import {
  walletCreateController,
  walletListController,
  walletGetController,
} from '../controllers/index.js';

const router = Router();

router.post(
  walletCreateConstant.ROUTE,
  ipTracker,
  rateLimiter(walletCreateConstant.RATE_LIMIT),
  auth,
  encryption,
  validate(walletCreateValidator),
  walletCreateController,
);

router.get(
  walletListConstant.ROUTE,
  ipTracker,
  rateLimiter(walletListConstant.RATE_LIMIT),
  auth,
  walletListController,
);

router.get(
  walletGetConstant.ROUTE,
  ipTracker,
  rateLimiter(walletGetConstant.RATE_LIMIT),
  auth,
  validate(walletGetValidator),
  walletGetController,
);

export { router as walletRoutes };
