import { getDb } from '../database/connection';

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface MessageRow {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  is_read: number;
}

function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    createdAt: row.created_at,
    isRead: row.is_read === 1,
  };
}

export function createMessage(
  conversationId: number,
  senderId: number,
  content: string,
): Message {
  const result = getDb()
    .prepare(
      `INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)`,
    )
    .run(conversationId, senderId, content);

  const row = getDb()
    .prepare('SELECT * FROM messages WHERE id = ?')
    .get(result.lastInsertRowid) as MessageRow;
  return toMessage(row);
}

/**
 * Paginated message listing. Passing `before` returns messages older than
 * that message id, newest-first by creation time.
 */
export function listMessages(
  conversationId: number,
  opts: { before?: number; limit: number },
): Message[] {
  const { before, limit } = opts;

  if (before) {
    const rows = getDb()
      .prepare(
        `SELECT * FROM messages
         WHERE conversation_id = ? AND id < ?
         ORDER BY created_at DESC, id DESC
         LIMIT ?`,
      )
      .all(conversationId, before, limit) as MessageRow[];
    return rows.reverse().map(toMessage);
  }

  const rows = getDb()
    .prepare(
      `SELECT * FROM messages
       WHERE conversation_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
    )
    .all(conversationId, limit) as MessageRow[];
  return rows.reverse().map(toMessage);
}

/** Marks all messages sent to `userId` in a conversation as read. */
export function markConversationRead(conversationId: number, userId: number): void {
  getDb()
    .prepare(
      `UPDATE messages SET is_read = 1
       WHERE conversation_id = ? AND sender_id != ? AND is_read = 0`,
    )
    .run(conversationId, userId);
}

export function getMessageById(id: number): Message | null {
  const row = getDb().prepare('SELECT * FROM messages WHERE id = ?').get(id) as MessageRow | undefined;
  return row ? toMessage(row) : null;
}