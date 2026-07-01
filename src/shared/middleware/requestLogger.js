import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger.js';
import { requestContext } from '../config/requestContext.js';

/**
 * Request lifecycle logger (rules/03 — cross-cutting, wired in app.js).
 *
 * - Adopts/propagates X-Request-Id (set by the gateway; generated if absent) so a
 *   single request can be traced across services and log files.
 * - Binds a child logger to { requestId, endpoint, method, path } and runs the WHOLE
 *   request inside AsyncLocalStorage, so services/repositories/steps/db-calls all log
 *   under the same correlation id without threading a param around.
 * - Logs "request received" (with sanitized body/query — secrets redacted by logger)
 *   and, on response finish, "request completed" (2xx/3xx) or "request failed" (>=400)
 *   with the status code and duration in ms.
 */
export const requestLogger = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.requestId = requestId;
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);

  const endpoint = `${req.method} ${req.originalUrl.split('?')[0]}`;
  const log = logger.child({ requestId, endpoint });
  req.log = log;

  const startedAt = process.hrtime.bigint();

  requestContext.run({ requestId, log }, () => {
    log.info(
      {
        method: req.method,
        path: req.originalUrl,
        ip: req.clientIp,
        ...(req.body && Object.keys(req.body).length ? { body: req.body } : {}),
        ...(req.query && Object.keys(req.query).length ? { query: req.query } : {}),
      },
      'request received',
    );

    res.on('finish', () => {
      const durationMs = Number((process.hrtime.bigint() - startedAt) / 1000000n);
      const payload = { statusCode: res.statusCode, durationMs };
      if (res.statusCode >= 500) {
        log.error(payload, 'request failed');
      } else if (res.statusCode >= 400) {
        log.warn(payload, 'request completed with client error');
      } else {
        log.info(payload, 'request completed');
      }
    });

    next();
  });
};
