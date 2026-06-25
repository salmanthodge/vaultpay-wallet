import { Router } from 'express';
import { transactionRoutes } from './routes/transaction.routes.js';
import { transactionDocs } from './docs/index.js';

const router = Router();
router.use('/', transactionRoutes);

export { router as transactionModule, transactionDocs };
