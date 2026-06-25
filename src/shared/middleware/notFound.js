import { NotFoundError } from '../errors/index.js';

export const notFound = (req, _res, next) =>
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
