import { z } from 'zod';
import { paginationQuery } from '../../../shared/validators/common.validator.js';

export const transferListValidator = z.object({
  query: paginationQuery,
});
