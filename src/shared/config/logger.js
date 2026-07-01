import { join } from 'node:path';
import { createRequire } from 'node:module';
import pino from 'pino';
import { env, isDevelopment } from './env.js';

/**
 * Centralized pino logger (rules/04 — log via shared/config/logger, never console.log).
 *
 * Fans out to multiple sinks via pino.multistream:
 *   - console  : pretty, colorized — you see EVERYTHING live (incl. debug SQL).
 *   - logs/combined-<date>.log : info+ (request flow, steps, successful db calls) — the "success" log.
 *   - logs/warn-<date>.log     : warnings only.
 *   - logs/error-<date>.log    : errors + fatal only.
 *
 * Secrets/tokens/passwords are redacted so they never reach any sink (rules/05).
 * Daily-dated filenames are chosen at process start.
 */

// pino level numbers: trace=10 debug=20 info=30 warn=40 error=50 fatal=60
const WARN = 40;
const ERROR = 50;
const FATAL = 60;

// lowest level anything is emitted at: debug in dev (so SQL queries show), else configured level.
const baseLevel = isDevelopment ? 'debug' : env.LOG_LEVEL;

const redact = {
  paths: [
    'req.headers.authorization',
    'req.headers.cookie',
    'password',
    '*.password',
    'data.password',
    'data.*.password',
    'passwordHash',
    '*.passwordHash',
    'token',
    '*.token',
    'accessToken',
    'refreshToken',
    'mfaToken',
    'secret',
    '*.secret',
    'body.password',
    'body.currentPassword',
    'body.newPassword',
    'params.token',
    'query.token',
  ],
  censor: '[redacted]',
};

/** A pino-multistream sink that only forwards log lines whose level is in `levels`. */
const levelFilterSink = (levels, dest) => ({
  write(line) {
    let level;
    try {
      level = JSON.parse(line).level;
    } catch {
      dest.write(line);
      return;
    }
    if (levels.has(level)) dest.write(line);
  },
});

// Console stream: pretty + colorized in dev (pino-pretty is a devDependency, absent
// in prod), raw JSON to stdout in production for log aggregators.
const buildConsoleStream = () => {
  if (!isDevelopment) return process.stdout;
  // dynamic require avoids importing pino-pretty when it isn't installed (prod)
  const require = createRequire(import.meta.url);
  const pretty = require('pino-pretty');
  return pretty({ colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' });
};

const buildStreams = () => {
  // console: shows everything down to baseLevel (pretty in dev, JSON in prod)
  const streams = [{ level: baseLevel, stream: buildConsoleStream() }];

  if (env.LOG_TO_FILE) {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const file = (name) =>
      pino.destination({ dest: join(env.LOG_DIR, `${name}-${date}.log`), mkdir: true, sync: false });

    // combined = the flow/success log: info and above (steps, "db call ok", request completed)
    streams.push({ level: 'info', stream: file('combined') });
    // warnings only
    streams.push({ level: 'warn', stream: levelFilterSink(new Set([WARN]), file('warn')) });
    // errors + fatal only
    streams.push({ level: 'error', stream: levelFilterSink(new Set([ERROR, FATAL]), file('error')) });
  }

  return streams;
};

export const logger = pino(
  { level: baseLevel, base: { service: env.SERVICE_NAME }, redact },
  pino.multistream(buildStreams()),
);
