import { ApiError } from '../utils/errors';
import {
  createMessage,
  listMessages,
  markConversationRead,
  Message,
} from '../models/message.model';
import { getConversationById, getMemberIds, isMember } from '../models/conversation.model';
import { emit } from '../socket/emitter';

function assertMembership(conversationId: number, userId: number): void {
  if (!getConversationById(conversationId)) {
    throw ApiError.notFound('Conversation not found');
  }
  if (!isMember(conversationId, userId)) {
    throw ApiError.forbidden('You are not a member of this conversation');
  }
}

export function sendMessage(conversationId: number, senderId: number, content: string): Message {
  assertMembership(conversationId, senderId);

  const message = createMessage(conversationId, senderId, content);
  const recipientIds = getMemberIds(conversationId).filter((id) => id !== senderId);

  emit('message:new', { conversationId, message, recipientIds });
  return message;
}

export function getMessages(
  conversationId: number,
  userId: number,
  opts: { before?: number; limit: number },
): Message[] {
  assertMembership(conversationId, userId);

  // Opening the chat marks received messages as read and tells the sender.
  markConversationRead(conversationId, userId);
  const recipientIds = getMemberIds(conversationId).filter((id) => id !== userId);
  emit('message:read', { conversationId, readerId: userId, recipientIds });

  return listMessages(conversationId, opts);
}