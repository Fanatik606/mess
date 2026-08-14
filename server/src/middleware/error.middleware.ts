import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/errors';

interface ErrorResponse {
  status: string;
  code: string;
  message: string;
  details?: unknown;
}

/** Logs and formats unexpected errors; not found handler and final error handler. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: 'Route not found',
  } satisfies ErrorResponse);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      status: 'error',
      code: err.code,
      message: err.message,
    } satisfies ErrorResponse);
  }

  if (err instanceof ZodError) {
    const first = err.errors[0];
    return res.status(422).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: first ? `${first.path.join('.')}: ${first.message}` : 'Invalid input',
    } satisfies ErrorResponse);
  }

  // Malformed JSON body.
  if (typeof err === 'object' && err !== null && (err as { type?: string }).type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'error',
      code: 'BAD_JSON',
      message: 'Request body is not valid JSON',
    } satisfies ErrorResponse);
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong',
  } satisfies ErrorResponse);
}