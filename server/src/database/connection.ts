import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

import { getDbPath } from './config';
import { SCHEMA_SQL } from './schema';

let db: Database.Database | null = null;

/**
 * Creates (if missing) the data directory and returns a singleton
 * better-sqlite3 connection, enabling sqlite foreign keys.
 */
export function getDb(): Database.Database {
  if (db) return db;

  const dbPath = getDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA_SQL);

  return db;
}