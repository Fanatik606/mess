import { ApiError } from '../utils/errors';
import { getUserById, listUsers, PublicUser, searchUsers } from '../models/user.model';
import { onlineRegistry } from '../socket/online';

export interface UserWithStatus extends PublicUser {
  online: boolean;
}

export function getUsers(userId: number, search?: string): UserWithStatus[] {
  const users = search ? searchUsers(search, userId, 50) : listUsers(userId, 50);
  const online = onlineRegistry.getOnlineSet();
  return users.map((u) => ({ ...u, online: online.has(u.id) }));
}

export function getUser(userId: number, viewerId: number): UserWithStatus {
  const user = getUserById(userId);
  if (!user || user.id === viewerId) throw ApiError.notFound('User not found');
  return { ...user, online: onlineRegistry.isOnline(user.id) };
}