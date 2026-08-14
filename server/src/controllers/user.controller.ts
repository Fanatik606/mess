import type { Request, Response } from 'express';
import { getUsers, getUser } from '../services/user.service';
import { asyncHandler, ApiError } from '../utils/errors';

export const listUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw ApiError.unauthorized();
  const search = (req.query.search as string | undefined) ?? undefined;
  const users = getUsers(req.userId, search);
  res.json({ users });
});

export const getUserHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw ApiError.unauthorized();
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw ApiError.badRequest('Invalid user id');
  const user = getUser(id, req.userId);
  res.json({ user });
});