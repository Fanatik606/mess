import bcrypt from 'bcryptjs';
import { getDb } from './connection';
import { SCHEMA_SQL } from './schema';

/**
 * Seeds the database with demo users and a meaningful conversation.
 * Run once: npm run seed  (from the server/ directory)
 */
const ROUNDS = 10;

async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

export async function main(): Promise<void> {
  const db = getDb();
  db.exec(SCHEMA_SQL);

  const existing = db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number };
  if (existing.count > 0) {
    console.log('Database already contains users — skipping seed.');
    return;
  }

  const users = [
    { username: 'alex', email: 'alex@example.com', password: 'password123', avatar: 'A' },
    { username: 'masha', email: 'masha@example.com', password: 'password123', avatar: 'M' },
    { username: 'denis', email: 'denis@example.com', password: 'password123', avatar: 'D' },
    { username: 'olga', email: 'olga@example.com', password: 'password123', avatar: 'O' },
    { username: 'kirill', email: 'kirill@example.com', password: 'password123', avatar: 'K' },
  ];

  const insertUser = db.prepare(
    `INSERT INTO users (username, email, password_hash, avatar) VALUES (?, ?, ?, ?)`,
  );

  for (const u of users) {
    const passwordHash = await hash(u.password);
    insertUser.run(u.username, u.email, passwordHash, u.avatar);
    console.log(`+ user ${u.username} (${u.email})`);
  }

  // Test conversation: alex <-> masha with a small history.
  const alex = db.prepare('SELECT id FROM users WHERE username = ?').get('alex') as { id: number };
  const masha = db.prepare('SELECT id FROM users WHERE username = ?').get('masha') as { id: number };

  const insertConv = db.prepare('INSERT INTO conversations DEFAULT VALUES');
  const insertMember = db.prepare('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)');
  const insertMessage = db.prepare(
    `INSERT INTO messages (conversation_id, sender_id, content, created_at, is_read) VALUES (?, ?, ?, datetime('now', ?), ?)`,
  );

  const convResult = insertConv.run();
  const convId = Number(convResult.lastInsertRowid);
  insertMember.run(convId, alex.id);
  insertMember.run(convId, masha.id);

  const messages: Array<[number, string, string, number]> = [
    [alex.id, 'Привет, Маша! 👋', '-30 minutes', 1],
    [masha.id, 'Привет, Саша! Как дела?', '-25 minutes', 1],
    [alex.id, 'Отлично! Работаю над портфолио-проектом 💻', '-20 minutes', 1],
    [masha.id, 'Круто! Это тот мессенджер?', '-15 minutes', 1],
    [alex.id, 'Да! Он уже умеет обмениваться сообщениями в реальном времени.', '-10 minutes', 1],
    [alex.id, 'Пиши мне, если что-то не так работает 😊', '-5 minutes', 0],
  ];

  for (const [senderId, content, offset, isRead] of messages) {
    insertMessage.run(convId, senderId, content, offset, isRead);
  }

  console.log(`+ conversation #${convId}: alex <-> masha with ${messages.length} messages`);
  console.log('Done. Login with alex@example.com / password123');
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}