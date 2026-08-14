import type { Request, Response } from 'express';
import { getChats, openConversation, getConversation } from '../services/chat.service';
import { isMember } from '../models/conversation.model';
import { asyncHandler, ApiError } from '../utils/errors';

export const listChatsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw ApiError.unauthorized();
  const chats = getChats(req.userId);
  res.json({ chats });
});

export const createChatHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw ApiError.unauthorized();
  const { userId } = req.body as { userId: number };
  const id = openConversation(req.userId, userId);
  res.status(201).json({ conversationId: id, conversation: getConversation(id) });
});

export const getChatHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw ApiError.unauthorized();
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw ApiError.badRequest('Invalid conversation id');
  if (!isMember(id, req.userId)) throw ApiError.forbidden('You are not a member of this conversation');
  res.json({ conversation: getConversation(id) });
});
