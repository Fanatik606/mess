import { getDb } from '../database/connection';

/** A user row. */
export interface UserRow {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
  last_seen: string | null;
}

/** A user as exposed by the API (never includes the password hash). */
export interface PublicUser {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  lastSeen: string | null;
}

function toPublic(user: UserRow): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.created_at,
    lastSeen: user.last_seen,
  };
}

export function createUser(data: {
  username: string;
  email: string;
  passwordHash: string;
}): PublicUser {
  const stmt = getDb().prepare(
    `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
  );
  const result = stmt.run(data.username, data.email, data.passwordHash);
  const user = getDb().prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as UserRow;
  return toPublic(user);
}

export function getUserById(id: number): PublicUser | null {
  const user = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  return user ? toPublic(user) : null;
}

export function getUserByEmail(email: string): UserRow | null {
  const user = getDb()
    .prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE')
    .get(email) as UserRow | undefined;
  return user ?? null;
}

export function getUserByUsername(username: string): UserRow | null {
  const user = getDb()
    .prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE')
    .get(username) as UserRow | undefined;
  return user ?? null;
}

export function getFullUserById(id: number): UserRow | null {
  const user = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  return user ?? null;
}

export function searchUsers(query: string, excludeId: number, limit: number): PublicUser[] {
  const pattern = `%${query}%`;
  const rows = getDb()
    .prepare(
      `SELECT * FROM users
       WHERE id != ? AND (username LIKE ? COLLATE NOCASE OR email LIKE ? COLLATE NOCASE)
       ORDER BY username COLLATE NOCASE ASC
       LIMIT ?`,
    )
    .all(excludeId, pattern, pattern, limit) as UserRow[];
  return rows.map(toPublic);
}

export function listUsers(excludeId: number, limit: number): PublicUser[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM users WHERE id != ? ORDER BY username COLLATE NOCASE ASC LIMIT ?`,
    )
    .all(excludeId, limit) as UserRow[];
  return rows.map(toPublic);
}

export function updateUser(id: number, fields: { username?: string; avatar?: string | null }): PublicUser {
  const current = getFullUserById(id);
  if (!current) throw new Error('User not found');

  const username = fields.username ?? current.username;
  const avatar =
    fields.avatar === undefined ? current.avatar : (fields.avatar ?? null);

  getDb()
    .prepare(
      `UPDATE users SET username = ?, avatar = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .run(username, avatar, id);

  const updated = getUserById(id);
  if (!updated) throw new Error('User not found');
  return updated;
}

export function touchLastSeen(id: number): void {
  getDb().prepare(`UPDATE users SET last_seen = datetime('now') WHERE id = ?`).run(id);
}