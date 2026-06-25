import { z } from 'zod';
import { amountBody } from './transaction.amount.validator.js';

export const transactionWithdrawValidator = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: amountBody,
});
