import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const booleanFromString = (defaultValue) =>
  z
    .preprocess((value) => {
      if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
      return value;
    }, z.boolean())
    .default(defaultValue);

const csv = (defaultValue = '') =>
  z
    .string()
    .default(defaultValue)
    .transform((value) =>
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    );

const schema = z.object({
  // runtime
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4002),
  SERVICE_NAME: z.string().default('wallet-service'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  // write logs to rotating daily files under LOG_DIR (in addition to the console)
  LOG_TO_FILE: booleanFromString(true),
  LOG_DIR: z.string().default('logs'),
  // print every Prisma SQL query (text + params + duration) to console/files
  DB_LOG_QUERIES: booleanFromString(true),

  // datastores
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  // customer JWT (verify only — shared secret with auth-service)
  JWT_ACCESS_SECRET: z.string().min(8),

  // service-to-service
  S2S_SECRET: z.string().min(8),
  S2S_CLIENT_ID: z.string().default('wallet-service'),
  S2S_CLIENT_SECRET: z.string().default(''),
  AUTH_SERVICE_URL: z.string().url().default('http://localhost:4001'),

  // encryption middleware toggle
  ENCRYPTION_ENABLED: booleanFromString(false),
  ENCRYPTION_KEY: z.string().min(32),

  // rate limiting
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  // cors
  CORS_ORIGINS: csv('http://localhost:3000'),

  // cluster
  CLUSTER_ENABLED: booleanFromString(false),
  CLUSTER_WORKERS: z.coerce.number().int().min(0).default(0),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  // eslint-disable-next-line no-console
  console.error(`[env] Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

export const env = Object.freeze(parsed.data);
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
