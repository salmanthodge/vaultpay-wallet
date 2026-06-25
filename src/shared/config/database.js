import { PrismaClient } from '@prisma/client';
import { env, isDevelopment } from './env.js';
import { logger } from './logger.js';

/**
 * Prisma singleton (vaultpay_wallet).
 *
 * HARD RULE (rules/04): this module — used only from repositories/ — is the ONLY
 * place `@prisma/client` is imported. Nothing else may import it.
 */
export const prisma = new PrismaClient({
  log: isDevelopment ? ['warn', 'error'] : ['error'],
});

export const connectDatabase = async () => {
  await prisma.$connect();
  logger.info('database connected');
};

/** Lightweight liveness probe for the health endpoint. */
export const pingDatabase = async () => {
  await prisma.$queryRaw`SELECT 1`;
  return true;
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  logger.info('database disconnected');
};

if (env.NODE_ENV !== 'test') {
  process.once('beforeExit', () => {
    void disconnectDatabase();
  });
}
