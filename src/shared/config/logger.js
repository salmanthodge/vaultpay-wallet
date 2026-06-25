import pino from 'pino';
import { env, isDevelopment } from './env.js';

/**
 * Centralized pino logger — pretty in dev, JSON in prod; redacts secrets/tokens
 * so they never reach logs (rules/05).
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: env.SERVICE_NAME },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'token',
      '*.token',
      'accessToken',
      'secret',
      '*.secret',
    ],
    censor: '[redacted]',
  },
  ...(isDevelopment
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
        },
      }
    : {}),
});
