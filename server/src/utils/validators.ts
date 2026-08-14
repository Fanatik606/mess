import { z } from 'zod';

/**
 * Centralized Zod schemas for all API inputs.
 * Using Zod gives us typed, fail-fast validation with readable errors.
 */

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must be at most 20 characters long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(72, 'Password is too long'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must be at most 20 characters long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores')
    .optional(),
  avatar: z.string().trim().min(1).max(2, 'Avatar must be a single character').optional(),
});

export const createChatSchema = z.object({
  userId: z.coerce.number().int().positive('userId must be a positive integer'),
});

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty').max(2000, 'Message is too long'),
});

export const listMessagesQuerySchema = z.object({
  // Load messages that come BEFORE the given id (for "load older" pagination).
  before: z.coerce.number().int().positive().optional(),
  // Number of messages per page.
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const searchUsersQuerySchema = z.object({
  search: z.string().trim().max(40).optional(),
});