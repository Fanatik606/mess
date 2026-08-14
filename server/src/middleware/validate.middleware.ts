import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { ApiError } from '../utils/errors';

type Location = 'body' | 'query' | 'params';

/**
 * Validates a request part against a Zod schema.
 * On failure throws a 422 ApiError with the first human-readable message.
 */
export function validate(schema: ZodSchema, location: Location = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const target = req[location];
    const result = schema.safeParse(target);

    if (!result.success) {
      const first = result.error.errors[0];
      const message = first ? `${first.path.join('.')}: ${first.message}` : 'Invalid input';
      return next(ApiError.unprocessable(message));
    }

    // Replace the parsed (and coerced) value so downstream code uses trusted data.
    (req as Record<string, unknown>)[location] = result.data;
    return next();
  };
}

/** Limits the size of incoming JSON payloads (defense in depth). */
export function jsonBodyLimit() {
  return {
    limit: '200kb',
  };
}