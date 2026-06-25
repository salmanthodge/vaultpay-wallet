import { Router } from 'express';
import { walletRoutes } from './routes/wallet.routes.js';
import { walletDocs } from './docs/index.js';

const router = Router();
router.use('/wallets', walletRoutes);

export { router as walletModule, walletDocs };
