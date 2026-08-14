import type { Request, Response } from 'express';
import { register, login, getCurrentUser, updateProfile } from '../services/auth.service';
import { asyncHandler, ApiError } from '../utils/errors';

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await register(req.body as { username: string; email: string; password: string });
  res.status(201).json({ token: result.token, user: result.user });
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await login(req.body as { email: string; password: string });
  res.json({ token: result.token, user: result.user });
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw ApiError.unauthorized();
  const user = await getCurrentUser(req.userId);
  res.json({ user });
});

export const updateProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw ApiError.unauthorized();
  const fields = req.body as { username?: string; avatar?: string };
  const user = await updateProfile(req.userId, fields);
  res.json({ user });
});