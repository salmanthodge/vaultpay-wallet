import { ValidationError } from '../errors/index.js';

/** Zod validation middleware (rules/06). Parses + replaces body/params/query. */
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) {
    return next(new ValidationError(result.error.flatten()));
  }
  if (result.data.body !== undefined) req.body = result.data.body;
  if (result.data.params !== undefined) req.params = result.data.params;
  if (result.data.query !== undefined) req.query = result.data.query;
  return next();
};
