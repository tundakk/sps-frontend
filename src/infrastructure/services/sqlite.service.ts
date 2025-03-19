import { injectable } from 'inversify';
import { ISqliteService } from '@/src/application/ports/sqlite.service.port';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

@injectable()
export class SqliteService implements ISqliteService {
  private db: Database | null = null;
  private dbPromise: Promise<Database> | null = null;

  private async getDb(): Promise<Database> {
    if (this.db) return this.db;
    
    if (!this.dbPromise) {
      this.dbPromise = open({
        filename: './data/app.db',
        driver: sqlite3.Database
      });
    }
    
    this.db = await this.dbPromise;
    return this.db;
  }

  async execute(query: string, params: unknown[] = []): Promise<void> {
    const db = await this.getDb();
    await db.run(query, ...params);
  }

  async query<T = Record<string, unknown>>(query: string, params: unknown[] = []): Promise<T[]> {
    const db = await this.getDb();
    return db.all<T[]>(query, ...params);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.dbPromise = null;
    }
  }
}