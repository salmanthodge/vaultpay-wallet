import { z } from 'zod';
import { currencies } from '../../../shared/constants/currencies.js';

export const walletCreateValidator = z.object({
  body: z
    .object({
      currency: z
        .string()
        .trim()
        .transform((v) => v.toUpperCase())
        .refine((v) => currencies.includes(v), {
          message: `Unsupported currency. Allowed: ${currencies.join(', ')}`,
        }),
    })
    .strict(),
});
