import { Router } from 'express';
import { transferRoutes } from './routes/transfer.routes.js';
import { transferDocs } from './docs/index.js';

const router = Router();
router.use('/transfers', transferRoutes);

export { router as transferModule, transferDocs };
