/** Shared client-side API types. */

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  lastSeen: string | null;
  online?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LastMessage {
  id: number;
  content: string;
  senderId: number;
  createdAt: string;
}

export interface ChatSummary {
  conversationId: number;
  createdAt: string;
  otherUser: {
    id: number;
    username: string;
    avatar: string | null;
    lastSeen: string | null;
    online: boolean;
  };
  lastMessage: LastMessage | null;
  unreadCount: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export type UserStatus = 'online' | 'offline' | 'recent';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginInput {
  email: string;
  password: string;
}