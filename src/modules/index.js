import { Router } from 'express';
import { walletModule, walletDocs } from './wallet/index.js';
import { transactionModule, transactionDocs } from './transaction/index.js';
import { transferModule, transferDocs } from './transfer/index.js';

const router = Router();
router.use(walletModule);
router.use(transactionModule);
router.use(transferModule);

/** Mounted router for all modules + aggregated OpenAPI paths (rules/01, rules/07). */
export { router as modules };
export const moduleDocs = {
  ...walletDocs,
  ...transactionDocs,
  ...transferDocs,
};
