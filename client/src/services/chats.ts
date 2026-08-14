import { api } from './api';
import { MESSAGE_PAGE_SIZE } from '../utils/constants';
import type { ChatSummary, Message } from '../types';

export async function fetchChats(): Promise<ChatSummary[]> {
  const { data } = await api.get<{ chats: ChatSummary[] }>('/chats');
  return data.chats;
}

export async function openChatWith(userId: number): Promise<{ conversationId: number }> {
  const { data } = await api.post<{ conversationId: number }>('/chats', { userId });
  return data;
}

export async function fetchMessages(
  conversationId: number,
  opts: { before?: number; limit?: number } = {},
): Promise<Message[]> {
  const { data } = await api.get<{ messages: Message[] }>(`/chats/${conversationId}/messages`, {
    params: {
      before: opts.before,
      limit: opts.limit ?? MESSAGE_PAGE_SIZE,
    },
  });
  return data.messages;
}

export async function sendMessageRequest(conversationId: number, content: string): Promise<Message> {
  const { data } = await api.post<{ message: Message }>(`/chats/${conversationId}/messages`, {
    content,
  });
  return data.message;
}