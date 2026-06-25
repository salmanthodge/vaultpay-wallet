import { redis } from '../config/redis.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { AppError } from '../errors/index.js';
import { httpStatus } from '../constants/httpStatus.js';
import { errorCodes } from '../constants/errorCodes.js';

/** Redis-backed fixed-window rate limiter; fails open on Redis errors (rules/05). */
export const rateLimiter =
  ({ key = 'global', max = env.RATE_LIMIT_MAX, windowSec = env.RATE_LIMIT_WINDOW_SECONDS } = {}) =>
  async (req, res, next) => {
    const identity = req.user?.id || req.clientIp || 'anonymous';
    const redisKey = `ratelimit:${key}:${identity}`;
    try {
      const count = await redis.incr(redisKey);
      if (count === 1) await redis.expire(redisKey, windowSec);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(max - count, 0));
      if (count > max) {
        const ttl = await redis.ttl(redisKey);
        res.setHeader('Retry-After', Math.max(ttl, 0));
        return next(
          new AppError(
            'Too many requests. Please try again later.',
            httpStatus.TOO_MANY_REQUESTS,
            errorCodes.RATE_LIMITED,
          ),
        );
      }
      return next();
    } catch (err) {
      logger.error({ err: err.message, key: redisKey }, 'rate limiter error — failing open');
      return next();
    }
  };
