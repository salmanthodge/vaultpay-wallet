import { Router } from 'express';
import { ipTracker, rateLimiter, auth, validate, encryption } from '../../../shared/middleware/index.js';
import { transferCreateConstant, transferListConstant, transferGetConstant } from '../constants/index.js';
import {
  transferCreateValidator,
  transferListValidator,
  transferGetValidator,
} from '../validators/index.js';
import {
  transferCreateController,
  transferListController,
  transferGetController,
} from '../controllers/index.js';

const router = Router();

router.post(
  transferCreateConstant.ROUTE,
  ipTracker,
  rateLimiter(transferCreateConstant.RATE_LIMIT),
  auth,
  encryption,
  validate(transferCreateValidator),
  transferCreateController,
);

router.get(
  transferListConstant.ROUTE,
  ipTracker,
  rateLimiter(transferListConstant.RATE_LIMIT),
  auth,
  validate(transferListValidator),
  transferListController,
);

router.get(
  transferGetConstant.ROUTE,
  ipTracker,
  rateLimiter(transferGetConstant.RATE_LIMIT),
  auth,
  validate(transferGetValidator),
  transferGetController,
);

export { router as transferRoutes };
