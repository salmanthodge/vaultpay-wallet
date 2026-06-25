import { z } from 'zod';
import { isValidAmount } from '../../../shared/utils/money.js';

export const transferCreateValidator = z.object({
  body: z
    .object({
      fromWalletId: z.string().uuid(),
      toWalletId: z.string().uuid(),
      amount: z
        .coerce.string()
        .refine(isValidAmount, { message: 'amount must be a positive value with up to 4 decimals' }),
      reference: z.string().min(3).max(100).trim().optional(),
      description: z.string().max(255).trim().optional(),
    })
    .strict(),
});
