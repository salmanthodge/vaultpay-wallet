import cluster from 'node:cluster';
import os from 'node:os';
import { env } from './env.js';
import { logger } from './logger.js';

/** Runs `start` directly, or forks workers when CLUSTER_ENABLED (rules/01). */
export const runWithCluster = (start) => {
  if (!env.CLUSTER_ENABLED) {
    start();
    return;
  }
  if (cluster.isPrimary) {
    const workers = env.CLUSTER_WORKERS > 0 ? env.CLUSTER_WORKERS : os.cpus().length;
    logger.info({ workers }, 'cluster primary starting workers');
    for (let i = 0; i < workers; i += 1) cluster.fork();
    cluster.on('exit', (worker) => {
      logger.warn({ pid: worker.process.pid }, 'worker exited — restarting');
      cluster.fork();
    });
  } else {
    start();
  }
};
