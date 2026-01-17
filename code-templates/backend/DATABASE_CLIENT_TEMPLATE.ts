import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// =============================================================================
// Database Configuration
// =============================================================================

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'myapp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  
  // Connection pool settings
  min: parseInt(process.env.DB_POOL_MIN || '2'),
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// =============================================================================
// Query Helpers
// =============================================================================

/**
 * Execute a query against the database
 * @param text - SQL query string
 * @param params - Query parameters
 * @returns Query result
 */
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries in development
    if (process.env.NODE_ENV !== 'production' && duration > 100) {
      console.log('Slow query:', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', { text, error });
    throw error;
  }
}

/**
 * Get a client from the pool for transaction support
 * Remember to release the client when done!
 */
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect();
  return client;
}

/**
 * Execute multiple queries in a transaction
 * @param callback - Function that receives a client and executes queries
 * @returns Result of the callback
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// =============================================================================
// Health Check
// =============================================================================

/**
 * Check database connectivity
 * @returns true if database is reachable
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT 1 as connected');
    return result.rows[0]?.connected === 1;
  } catch {
    return false;
  }
}

/**
 * Get database connection status
 */
export async function getStatus(): Promise<{
  connected: boolean;
  totalConnections: number;
  idleConnections: number;
  waitingClients: number;
}> {
  return {
    connected: await checkConnection(),
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount,
  };
}

// =============================================================================
// Cleanup
// =============================================================================

/**
 * Close all connections in the pool
 * Call this when shutting down the application
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await closePool();
  process.exit(0);
});

export { pool };
