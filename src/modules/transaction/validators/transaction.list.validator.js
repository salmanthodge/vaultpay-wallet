import { z } from 'zod';
import { paginationQuery } from '../../../shared/validators/common.validator.js';

export const transactionListValidator = z.object({
  params: z.object({ id: z.string().uuid() }),
  query: paginationQuery,
});
