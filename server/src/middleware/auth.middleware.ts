import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../services/auth.service';
import { ApiError } from '../utils/errors';

// Augment Express Request with the authenticated user id.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

/**
 * Requires a valid bearer token (Authorization: Bearer <jwt>) and attaches
 * the decoded user id to req.userId.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing authorization header'));
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next(ApiError.unauthorized('Missing authorization token'));
  }

  try {
    const { id } = verifyToken(token);
    req.userId = id;
    return next();
  } catch (err) {
    return next(err);
  }
}