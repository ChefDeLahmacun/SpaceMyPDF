import { Pool } from 'pg';

let pool: Pool | null = null;

// Database connection using PostgreSQL connection pool
export class Database {
  // Get or create connection pool
  private static getPool(): Pool {
    if (!pool) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
        ssl: {
          rejectUnauthorized: false
        },
        max: 20, // Maximum connections in pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 10000, // Timeout if connection takes longer than 10 seconds
      });

      // Handle pool errors
      pool.on('error', (err) => {
        console.error('Unexpected pool error:', err);
      });
    }
    return pool;
  }

  // Execute a query and return results
  static async query(text: string, params?: any[]) {
    const pool = this.getPool();
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Execute a query and return a single row
  static async queryOne(text: string, params?: any[]) {
    const pool = this.getPool();
    try {
      const result = await pool.query(text, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Execute a query and return multiple rows
  static async queryMany(text: string, params?: any[]) {
    const pool = this.getPool();
    try {
      const result = await pool.query(text, params);
      return result.rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Execute a transaction
  static async transaction(callback: (client: any) => Promise<any>) {
    const pool = this.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Test database connection
  static async testConnection() {
    const pool = this.getPool();
    try {
      await pool.query('SELECT NOW()');
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  // Close all connections (useful for graceful shutdown)
  static async closePool() {
    if (pool) {
      await pool.end();
      pool = null;
    }
  }
}

// Export for backward compatibility
export const query = Database.query;
export const queryOne = Database.queryOne;
export const queryMany = Database.queryMany;