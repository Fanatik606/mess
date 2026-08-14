import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { getJwtExpiresIn, getJwtSecret } from '../utils/config';
import { ApiError } from '../utils/errors';
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
  getFullUserById,
  updateUser,
  PublicUser,
} from '../models/user.model';

export interface AuthPayload {
  id: number;
  username: string;
  email: string;
}

export interface AuthResult {
  token: string;
  user: PublicUser;
}

const BCRYPT_ROUNDS = 10;

export function signToken(payload: Pick<AuthPayload, 'id'>): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiresIn() });
}

export function verifyToken(token: string): { id: number } {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === 'string' || !('id' in decoded)) {
      throw new Error('Malformed token');
    }
    return { id: Number((decoded as { id: unknown }).id) };
  } catch {
    throw ApiError.unauthorized('Invalid or expired token', 'INVALID_TOKEN');
  }
}

export async function register(input: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const username = input.username.toLowerCase();
  const email = input.email.toLowerCase();

  if (await getUserByUsername(username)) {
    throw ApiError.conflict('This username is already taken', 'USERNAME_TAKEN');
  }
  if (await getUserByEmail(email)) {
    throw ApiError.conflict('This email is already registered', 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = createUser({ username, email, passwordHash });
  const token = signToken({ id: user.id });

  return { token, user };
}

export async function login(input: { email: string; password: string }): Promise<AuthResult> {
  const user = await getUserByEmail(input.email.toLowerCase());
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const token = signToken({ id: user.id });
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.created_at,
      lastSeen: user.last_seen,
    },
  };
}

export async function getCurrentUser(id: number): Promise<PublicUser> {
  const user = getFullUserById(id);
  if (!user) throw ApiError.notFound('User not found');
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.created_at,
    lastSeen: user.last_seen,
  };
}

export async function updateProfile(
  id: number,
  fields: { username?: string; avatar?: string },
): Promise<PublicUser> {
  if (fields.username) {
    const existing = await getUserByUsername(fields.username.toLowerCase());
    if (existing && existing.id !== id) {
      throw ApiError.conflict('This username is already taken', 'USERNAME_TAKEN');
    }
  }
  return updateUser(id, {
    username: fields.username?.toLowerCase(),
    avatar: fields.avatar,
  });
}