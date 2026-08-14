import type { Request, Response } from 'express';
import { sendMessage, getMessages } from '../services/message.service';
import { asyncHandler, ApiError } from '../utils/errors';

export const sendMessageHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw ApiError.unauthorized();
  const conversationId = Number(req.params.id);
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    throw ApiError.badRequest('Invalid conversation id');
  }
  const { content } = req.body as { content: string };
  const message = sendMessage(conversationId, req.userId, content);
  res.status(201).json({ message });
});

export const getMessagesHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw ApiError.unauthorized();
  const conversationId = Number(req.params.id);
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    throw ApiError.badRequest('Invalid conversation id');
  }

  const before = req.query.before ? Number(req.query.before) : undefined;
  const limit = Number(req.query.limit ?? 30);

  const messages = getMessages(conversationId, req.userId, {
    before,
    limit,
  });
  res.json({ messages });
});