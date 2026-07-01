import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Request-scoped context (rules/03 — cross-cutting concern in shared/config).
 *
 * Backed by AsyncLocalStorage so ANY layer (service, repository) can log with the
 * same correlation id and request-bound child logger WITHOUT threading a param
 * through every function signature. The requestLogger middleware runs the whole
 * request inside `requestContext.run({ requestId, log }, ...)`.
 *
 * The store shape: { requestId: string, log: import('pino').Logger }
 */
export const requestContext = new AsyncLocalStorage();

/** The current request store, or undefined outside a request (e.g. at boot). */
export const getContext = () => requestContext.getStore();

/** The current request id, or undefined outside a request. */
export const getRequestId = () => requestContext.getStore()?.requestId;

/**
 * The request-bound child logger if inside a request, else the given fallback.
 * Callers pass the base `logger` as fallback so logging always works at boot.
 */
export const getContextLogger = (fallback) => requestContext.getStore()?.log ?? fallback;
