export interface ISqliteService {
    /**
     * Execute a SQL statement with optional parameters
     */
    execute(query: string, params?: unknown[]): Promise<void>;
    
    /**
     * Execute a SQL query and return results
     */
    query<T = Record<string, unknown>>(query: string, params?: unknown[]): Promise<T[]>;
    
    /**
     * Close database connection
     */
    close(): Promise<void>;
  }