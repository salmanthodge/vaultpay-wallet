import { z } from 'zod';
import { idParams } from '../../../shared/validators/common.validator.js';

export const transactionGetValidator = z.object({
  params: idParams,
});
