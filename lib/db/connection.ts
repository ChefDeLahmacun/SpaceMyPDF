import { Client } from 'pg';

let client: Client | null = null;

// Database connection using standard PostgreSQL client
export class Database {
  // Execute a query and return results
  static async query(text: string, params?: any[]) {
    try {
      const db = await this.getConnection();
      const result = await db.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Execute a query and return a single row
  static async queryOne(text: string, params?: any[]) {
    try {
      const db = await this.getConnection();
      const result = await db.query(text, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Execute a query and return multiple rows
  static async queryMany(text: string, params?: any[]) {
    try {
      const db = await this.getConnection();
      const result = await db.query(text, params);
      return result.rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Execute a transaction
  static async transaction(callback: (client: Client) => Promise<any>) {
    const db = await this.getConnection();
    try {
      await db.query('BEGIN');
      const result = await callback(db);
      await db.query('COMMIT');
      return result;
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Database transaction error:', error);
      throw error;
    }
  }

  // Test database connection
  static async testConnection() {
    try {
      const db = await this.getConnection();
      const result = await db.query('SELECT NOW()');
      console.log('Database connection successful:', result.rows[0]);
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  // Get or create database connection
  private static async getConnection(): Promise<Client> {
    if (!client) {
      client = new Client({
        connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
        ssl: {
          rejectUnauthorized: false  // Bypass SSL certificate verification for local dev
        }
      });
      await client.connect();
      console.log('Successfully connected to database.');
    }
    return client;
  }
}

// Export for backward compatibility
export const query = Database.query;
export const queryOne = Database.queryOne;
export const queryMany = Database.queryMany;