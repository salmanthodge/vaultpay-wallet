import { buildApp } from './app.js';
import { env } from './shared/config/env.js';
import { logger } from './shared/config/logger.js';
import { connectDatabase, disconnectDatabase } from './shared/config/database.js';
import { disconnectRedis } from './shared/config/redis.js';
import { runWithCluster } from './shared/config/cluster.js';

const start = async () => {
  await connectDatabase();

  const app = buildApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`${env.SERVICE_NAME} listening on http://localhost:${env.PORT} (pid ${process.pid})`);
  });

  const shutdown = (signal) => {
    logger.info({ signal }, 'shutting down');
    server.close(async () => {
      await disconnectDatabase().catch(() => {});
      await disconnectRedis().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => shutdown(signal)));
};

runWithCluster(() => {
  start().catch((err) => {
    logger.error({ err: err.message }, 'failed to start service');
    process.exit(1);
  });
});
