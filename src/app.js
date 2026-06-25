import { readFileSync } from 'node:fs';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { env } from './shared/config/env.js';
import { pingDatabase } from './shared/config/database.js';
import { redis } from './shared/config/redis.js';
import { swaggerServe, swaggerSetup, buildOpenApiSpec } from './shared/config/swagger.js';
import { response, notFound, errorHandler } from './shared/middleware/index.js';
import { asyncHandler } from './shared/utils/asyncHandler.js';
import { modules } from './modules/index.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));

/**
 * Builds the Express app (no listen — server.js owns that, rules/01). Wires
 * hardening, parsers, the response envelope, health, swagger, module routers,
 * and the centralized 404 + error handlers. No cookie-parser: this service has
 * no cookie-based sessions (customer JWT + S2S only).
 */
export const buildApp = () => {
  const app = express();

  app.set('trust proxy', true);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(response);

  // ---- health (rich, with dependency checks) ----
  app.get(
    '/health',
    asyncHandler(async (_req, res) => {
      const startedAt = process.hrtime.bigint();
      const [dbOk, redisOk] = await Promise.all([
        pingDatabase().then(() => true).catch(() => false),
        redis.ping().then((r) => r === 'PONG').catch(() => false),
      ]);
      const healthy = dbOk && redisOk;
      const mem = process.memoryUsage();
      const toMb = (b) => Math.round((b / 1024 / 1024) * 100) / 100;

      res.status(healthy ? 200 : 503).json({
        status: healthy ? 'ok' : 'degraded',
        service: env.SERVICE_NAME,
        version: pkg.version,
        environment: env.NODE_ENV,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        pid: process.pid,
        node: process.version,
        checks: { database: dbOk ? 'up' : 'down', redis: redisOk ? 'up' : 'down' },
        memoryMb: { rss: toMb(mem.rss), heapUsed: toMb(mem.heapUsed), heapTotal: toMb(mem.heapTotal) },
        responseTimeMs: Number((process.hrtime.bigint() - startedAt) / 1000000n),
      });
    }),
  );

  // ---- API docs ----
  app.use('/docs', swaggerServe, swaggerSetup);
  app.get('/openapi.json', (_req, res) => res.json(buildOpenApiSpec()));

  // ---- modules ----
  app.use(modules);

  // ---- 404 + centralized errors (last) ----
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
