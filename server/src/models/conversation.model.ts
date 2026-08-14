import { getDb } from '../database/connection';

/** Shape of a conversation as presented in the chat list. */
export interface ChatSummary {
  conversationId: number;
  otherUser: {
    id: number;
    username: string;
    avatar: string | null;
    lastSeen: string | null;
    online: boolean;
  };
  lastMessage: {
    id: number;
    content: string;
    senderId: number;
    createdAt: string;
  } | null;
  unreadCount: number;
  createdAt: string;
}

interface ChatSummaryRow {
  conversation_id: number;
  created_at: string;
  other_id: number;
  other_username: string;
  other_avatar: string | null;
  other_last_seen: string | null;
  lm_id: number | null;
  lm_content: string | null;
  lm_sender_id: number | null;
  lm_created_at: string | null;
}

export function findOrCreateConversation(userA: number, userB: number): { id: number; created: boolean } {
  if (userA === userB) throw new Error('Cannot chat with yourself');

  const db = getDb();

  // Look up an existing 2-member conversation between these users.
  const existing = db
    .prepare(
      `SELECT cm1.conversation_id AS id
       FROM conversation_members cm1
       JOIN conversation_members cm2 ON cm2.conversation_id = cm1.conversation_id
       WHERE cm1.user_id = ? AND cm2.user_id = ?
         AND (SELECT COUNT(*) FROM conversation_members cm WHERE cm.conversation_id = cm1.conversation_id) = 2
       LIMIT 1`,
    )
    .get(userA, userB) as { id: number } | undefined;

  if (existing) return { id: existing.id, created: false };

  const insertConversation = db.prepare('INSERT INTO conversations DEFAULT VALUES');
  const insertMember = db.prepare(
    `INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)`,
  );

  const transaction = db.transaction(() => {
    const result = insertConversation.run();
    const conversationId = Number(result.lastInsertRowid);
    insertMember.run(conversationId, userA);
    insertMember.run(conversationId, userB);
    return conversationId;
  });

  const id = transaction();
  return { id, created: true };
}

export function getConversationById(id: number): { id: number; created_at: string } | null {
  const row = getDb()
    .prepare('SELECT id, created_at FROM conversations WHERE id = ?')
    .get(id) as { id: number; created_at: string } | undefined;
  return row ?? null;
}

export function isMember(conversationId: number, userId: number): boolean {
  const row = getDb()
    .prepare('SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?')
    .get(conversationId, userId);
  return !!row;
}

export function getMemberIds(conversationId: number): number[] {
  const rows = getDb()
    .prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ?')
    .all(conversationId) as { user_id: number }[];
  return rows.map((r) => r.user_id);
}

/**
 * Returns all conversations the user belongs to, enriched with the other
 * participant, the latest message and the unread counter.
 */
export function listConversations(
  userId: number,
  onlineIds: Set<number>,
): ChatSummary[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT
         c.id                  AS conversation_id,
         c.created_at          AS created_at,
         other_user.id         AS other_id,
         other_user.username   AS other_username,
         other_user.avatar     AS other_avatar,
         other_user.last_seen  AS other_last_seen,
         lm.id                 AS lm_id,
         lm.content            AS lm_content,
         lm.sender_id          AS lm_sender_id,
         lm.created_at         AS lm_created_at
       FROM conversations c
       JOIN conversation_members me
         ON me.conversation_id = c.id AND me.user_id = ?
       JOIN conversation_members other_member
         ON other_member.conversation_id = c.id AND other_member.user_id != ?
       JOIN users other_user ON other_user.id = other_member.user_id
       LEFT JOIN messages lm ON lm.id = (
         SELECT id FROM messages m WHERE m.conversation_id = c.id
         ORDER BY m.created_at DESC, m.id DESC LIMIT 1
       )
       ORDER BY COALESCE(lm.created_at, c.created_at) DESC`,
    )
    .all(userId, userId) as ChatSummaryRow[];

  return rows.map((row) => {
    const unread = db
      .prepare(
        `SELECT COUNT(*) AS count FROM messages
         WHERE conversation_id = ? AND is_read = 0 AND sender_id != ?`,
      )
      .get(row.conversation_id, userId) as { count: number };

    return {
      conversationId: row.conversation_id,
      createdAt: row.created_at,
      otherUser: {
        id: row.other_id,
        username: row.other_username,
        avatar: row.other_avatar,
        lastSeen: row.other_last_seen,
        online: onlineIds.has(row.other_id),
      },
      lastMessage: row.lm_id
        ? {
            id: row.lm_id,
            content: row.lm_content,
            senderId: row.lm_sender_id,
            createdAt: row.lm_created_at,
          }
        : null,
      unreadCount: unread.count,
    };
  });
}

export function getUnreadCount(conversationId: number, userId: number): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS count FROM messages
       WHERE conversation_id = ? AND is_read = 0 AND sender_id != ?`,
    )
    .get(conversationId, userId) as { count: number };
  return row.count;
}
