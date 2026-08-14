import { api } from './api';
import type { User } from '../types';

export async function searchUsers(query: string): Promise<User[]> {
  if (!query.trim()) return [];
  const { data } = await api.get<{ users: User[] }>('/users', {
    params: { search: query.trim() },
  });
  return data.users;
}

export async function fetchAllUsers(): Promise<User[]> {
  const { data } = await api.get<{ users: User[] }>('/users');
  return data.users;
}