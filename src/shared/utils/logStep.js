import { logger } from '../config/logger.js';
import { getContextLogger } from '../config/requestContext.js';

/**
 * Log a named business-logic step, correlated with the current request (rules/03).
 *
 * Usable from ANY layer (controller/service) — it reads the request-bound child
 * logger from AsyncLocalStorage, so the log line automatically carries the same
 * requestId + endpoint as the surrounding request. Falls back to the base logger
 * outside a request. Sensitive fields in `data` are redacted by the logger config.
 *
 * @param {string} step   short human name of the step (e.g. 'verifying credentials')
 * @param {object} [data] optional structured data captured at this step
 *
 * @example
 *   logStep('loading wallet', { walletId });
 *   const wallet = await walletRepository.findById(walletId);
 *   logStep('wallet loaded', { balance: wallet.balance });
 */
export const logStep = (step, data) => {
  const log = getContextLogger(logger);
  log.info({ step, ...(data !== undefined ? { data } : {}) }, `step: ${step}`);
};

/**
 * Log a step that is about to fail, then the caller throws a typed error. Use this
 * right before a business `throw` so the failure reason is visible inline in the
 * flow (the centralized errorHandler also logs the thrown error at the boundary).
 *
 * @param {string} step   short human name of what failed
 * @param {object} [data] optional structured data (reason, ids)
 */
export const logStepFailure = (step, data) => {
  const log = getContextLogger(logger);
  log.warn({ step, ...(data !== undefined ? { data } : {}) }, `step failed: ${step}`);
};
