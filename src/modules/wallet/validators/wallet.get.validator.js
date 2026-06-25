import { z } from 'zod';
import { idParams } from '../../../shared/validators/common.validator.js';

export const walletGetValidator = z.object({
  params: idParams,
});
