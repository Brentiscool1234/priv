import { getDb } from './client';
import { SCHEMA_SQL } from './schema';
import { logger } from '../lib/logger';

export function runMigrations(): void {
  const db = getDb();
  logger.info('Running database migrations...');
  db.exec(SCHEMA_SQL);

  // Add columns that didn't exist in the original schema
  const addIfMissing = (sql: string) => {
    try { db.exec(sql); } catch { /* column already exists */ }
  };
  addIfMissing("ALTER TABLE projects ADD COLUMN theme TEXT DEFAULT 'horizon'");
  addIfMissing("ALTER TABLE generated_pages ADD COLUMN images_json TEXT DEFAULT '[]'");

  logger.info('Database migrations complete');
}
