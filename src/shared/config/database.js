import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from './logger.js';
import { getContextLogger, getRequestId } from './requestContext.js';

/**
 * Prisma singleton (vaultpay_wallet).
 *
 * HARD RULE (rules/04): this module — used only from repositories/ — is the ONLY
 * place `@prisma/client` is imported. Nothing else may import it.
 *
 * Logging (rules/03): every DB call is observable and correlated to its request:
 *   - $on('query')  -> the raw SQL + params + duration (debug: console/analysis).
 *   - $use()        -> one "db call ok" (info) or "db call failed" (error) line per
 *                      repository operation, so a multi-db-call flow shows a clear,
 *                      per-call success/failure trail tied to the same requestId.
 */
export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ],
});

// Raw SQL for every query (text + params + duration). Verbose -> debug level, so it
// shows in the dev console for analysis but does not clutter the info-level log files.
if (env.DB_LOG_QUERIES) {
  prisma.$on('query', (e) => {
    getContextLogger(logger).debug(
      { query: e.query, params: e.params, durationMs: e.duration, requestId: getRequestId() },
      'db query',
    );
  });
}

prisma.$on('warn', (e) => logger.warn({ target: e.target }, e.message));
prisma.$on('error', (e) => logger.error({ target: e.target }, e.message));

// Per-call success/failure logging for every repository operation.
prisma.$use(async (params, next) => {
  const label = params.model ? `${params.model}.${params.action}` : params.action;
  const startedAt = process.hrtime.bigint();
  const log = getContextLogger(logger);
  try {
    const result = await next(params);
    const durationMs = Number((process.hrtime.bigint() - startedAt) / 1000000n);
    log.info({ model: params.model, action: params.action, durationMs, requestId: getRequestId() }, `db call ok: ${label}`);
    return result;
  } catch (err) {
    const durationMs = Number((process.hrtime.bigint() - startedAt) / 1000000n);
    log.error(
      { model: params.model, action: params.action, durationMs, error: err.message, requestId: getRequestId() },
      `db call failed: ${label}`,
    );
    throw err;
  }
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
