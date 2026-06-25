import { z } from 'zod';
import { isValidAmount } from '../../../shared/utils/money.js';

/** Shared body schema for deposit/withdraw (amount + optional idempotency reference). */
export const amountBody = z
  .object({
    amount: z
      .coerce.string()
      .refine(isValidAmount, { message: 'amount must be a positive value with up to 4 decimals' }),
    reference: z.string().min(3).max(100).trim().optional(),
    description: z.string().max(255).trim().optional(),
  })
  .strict();
