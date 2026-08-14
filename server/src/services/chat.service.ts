import { ApiError } from '../utils/errors';
import { getUserById } from '../models/user.model';
import {
  ChatSummary,
  findOrCreateConversation,
  getConversationById,
  listConversations,
} from '../models/conversation.model';
import { onlineRegistry } from '../socket/online';

export function getChats(userId: number): ChatSummary[] {
  const online = onlineRegistry.getOnlineSet();
  return listConversations(userId, online);
}

export function openConversation(userId: number, otherUserId: number): number {
  if (userId === otherUserId) {
    throw ApiError.badRequest('You cannot start a chat with yourself');
  }
  if (!getUserById(otherUserId)) {
    throw ApiError.notFound('User not found');
  }
  const { id } = findOrCreateConversation(userId, otherUserId);
  return id;
}

export function getConversation(conversationId: number): { id: number; createdAt: string } {
  const conversation = getConversationById(conversationId);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  return { id: conversation.id, createdAt: conversation.created_at };
}