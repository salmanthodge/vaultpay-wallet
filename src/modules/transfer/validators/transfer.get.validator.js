import { z } from 'zod';
import { idParams } from '../../../shared/validators/common.validator.js';

export const transferGetValidator = z.object({
  params: idParams,
});
