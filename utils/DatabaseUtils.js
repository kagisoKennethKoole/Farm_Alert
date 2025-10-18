import { getDatabaseConfig } from "../config/db";

const db = getDatabaseConfig();
const pool = db.getPool();

/**
 * Custom error class for database errors
 */
export class DatabaseError extends Error {
    constructor(message, code = null, details = null) {
        super(message);
        this.name = 'DatabaseError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Wrap database queries with error handling
 * @param {Function} queryFunction - Async function that performs the query
 * @param {string} operation - Description of the operation
 * @returns {Promise} Result of the query
 */
export const withErrorHandling = async (queryFunction, operation) => {
    try {
        return await queryFunction();
    } catch (err) {
        console.error(`❌ Database error during ${operation}:`, err);
        
        // PostgreSQL specific error codes
        const errorMap = {
            '23505': 'Duplicate entry - record already exists',
            '23503': 'Foreign key constraint violation',
            '23502': 'Required field is missing',
            '22P02': 'Invalid input format',
            '42P01': 'Table does not exist',
            '42703': 'Column does not exist'
        };

        const userMessage = errorMap[err.code] || 'Database operation failed';
        
        throw new DatabaseError(
            `${operation} failed: ${userMessage}`,
            err.code,
            err.detail
        );
    }
};

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
export const testConnection = async () => {
    try {
        const res = await pool.query('SELECT NOW() as current_time');
        console.log('✅ Database connected successfully at:', res.rows[0].current_time);
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        return false;
    }
};

/**
 * Execute a query with automatic retry on failure
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise} Query result
 */
export const queryWithRetry = async (query, params = [], maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await pool.query(query, params);
        } catch (err) {
            lastError = err;
            console.warn(`Query attempt ${attempt}/${maxRetries} failed:`, err.message);
            
            if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
    
    throw new DatabaseError(
        `Query failed after ${maxRetries} attempts`,
        lastError.code,
        lastError.message
    );
};

/**
 * Batch insert records with transaction support
 * @param {string} tableName - Name of the table
 * @param {Array} records - Array of records to insert
 * @param {Array} columns - Column names
 * @returns {Promise<number>} Number of inserted records
 */
export const batchInsert = async (tableName, records, columns) => {
    if (!records || records.length === 0) {
        return 0;
    }

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        let insertedCount = 0;
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        
        for (const record of records) {
            const values = columns.map(col => record[col]);
            await client.query(query, values);
            insertedCount++;
        }
        
        await client.query('COMMIT');
        console.log(`✅ Inserted ${insertedCount} records into ${tableName}`);
        return insertedCount;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Batch insert failed for ${tableName}:`, err.message);
        throw new DatabaseError(`Batch insert failed`, err.code, err.message);
    } finally {
        client.release();
    }
};

/**
 * Get database statistics
 * @returns {Promise<Object>} Database statistics
 */
export const getDatabaseStats = async () => {
    try {
        const queries = {
            totalUsers: 'SELECT COUNT(*) as count FROM users',
            totalFarms: 'SELECT COUNT(*) as count FROM farms',
            totalCrops: 'SELECT COUNT(*) as count FROM crops_master',
            activePlantings: "SELECT COUNT(*) as count FROM planting_records WHERE status = 'active'",
            weatherRecords: 'SELECT COUNT(*) as count FROM weather_data',
            regions: 'SELECT COUNT(*) as count FROM regions'
        };

        const results = {};
        
        for (const [key, query] of Object.entries(queries)) {
            const res = await pool.query(query);
            results[key] = parseInt(res.rows[0].count);
        }

        // Get pool statistics
        results.poolStats = {
            totalClients: pool.totalCount,
            idleClients: pool.idleCount,
            waitingClients: pool.waitingCount
        };

        return results;
    } catch (err) {
        console.error('❌ Failed to get database stats:', err.message);
        throw new DatabaseError('Failed to retrieve database statistics', err.code);
    }
};

/**
 * Paginate query results
 * @param {string} baseQuery - Base SQL query (without LIMIT/OFFSET)
 * @param {Array} params - Query parameters
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Number of records per page
 * @returns {Promise<Object>} Paginated results with metadata
 */
export const paginate = async (baseQuery, params = [], page = 1, pageSize = 20) => {
    try {
        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_query`;
        const countRes = await pool.query(countQuery, params);
        const total = parseInt(countRes.rows[0].total);

        // Calculate pagination
        const totalPages = Math.ceil(total / pageSize);
        const offset = (page - 1) * pageSize;

        // Get paginated results
        const paginatedQuery = `${baseQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        const dataRes = await pool.query(paginatedQuery, [...params, pageSize, offset]);

        return {
            data: dataRes.rows,
            pagination: {
                page,
                pageSize,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    } catch (err) {
        console.error('❌ Pagination failed:', err.message);
        throw new DatabaseError('Pagination failed', err.code);
    }
};

/**
 * Search across multiple tables
 * @param {string} searchTerm - Term to search for
 * @param {Array} tables - Tables to search in
 * @returns {Promise<Object>} Search results grouped by table
 */
export const globalSearch = async (searchTerm, tables = ['crops_master', 'regions', 'farms']) => {
    try {
        const results = {};
        const term = `%${searchTerm.toLowerCase()}%`;

        const tableQueries = {
            crops_master: `
                SELECT id, name, 'crop' as type 
                FROM crops_master 
                WHERE LOWER(name) LIKE $1
                LIMIT 10
            `,
            regions: `
                SELECT id, name, 'region' as type 
                FROM regions 
                WHERE LOWER(name) LIKE $1
                LIMIT 10
            `,
            farms: `
                SELECT f.id, f.name, 'farm' as type, r.name as region
                FROM farms f
                LEFT JOIN regions r ON f.region_id = r.id
                WHERE LOWER(f.name) LIKE $1
                LIMIT 10
            `
        };

        for (const table of tables) {
            if (tableQueries[table]) {
                const res = await pool.query(tableQueries[table], [term]);
                results[table] = res.rows;
            }
        }

        return results;
    } catch (err) {
        console.error('❌ Global search failed:', err.message);
        throw new DatabaseError('Search failed', err.code);
    }
};

/**
 * Backup a table to JSON
 * @param {string} tableName - Name of the table to backup
 * @returns {Promise<Array>} Table data as JSON
 */
export const backupTable = async (tableName) => {
    try {
        const res = await pool.query(`SELECT * FROM ${tableName}`);
        console.log(`✅ Backed up ${res.rows.length} records from ${tableName}`);
        return res.rows;
    } catch (err) {
        console.error(`❌ Backup failed for ${tableName}:`, err.message);
        throw new DatabaseError(`Backup failed for ${tableName}`, err.code);
    }
};

/**
 * Clean up old records
 * @param {string} tableName - Name of the table
 * @param {string} dateColumn - Name of the date column
 * @param {number} daysOld - Delete records older than this many days
 * @returns {Promise<number>} Number of deleted records
 */
export const cleanupOldRecords = async (tableName, dateColumn = 'created_at', daysOld = 365) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const query = `
            DELETE FROM ${tableName}
            WHERE ${dateColumn} < NOW() - INTERVAL '${daysOld} days'
        `;
        
        const res = await client.query(query);
        await client.query('COMMIT');
        
        console.log(`✅ Deleted ${res.rowCount} old records from ${tableName}`);
        return res.rowCount;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Cleanup failed for ${tableName}:`, err.message);
        throw new DatabaseError(`Cleanup failed`, err.code);
    } finally {
        client.release();
    }
};

/**
 * Validate required fields before insert/update
 * @param {Object} data - Data to validate
 * @param {Array} requiredFields - List of required field names
 * @throws {DatabaseError} If validation fails
 */
export const validateRequiredFields = (data, requiredFields) => {
    const missing = requiredFields.filter(field => 
        data[field] === undefined || data[field] === null || data[field] === ''
    );

    if (missing.length > 0) {
        throw new DatabaseError(
            `Missing required fields: ${missing.join(', ')}`,
            '23502'
        );
    }
};

/**
 * Sanitize user input for SQL queries
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    // Remove potential SQL injection patterns
    return input
        .replace(/['";]/g, '') // Remove quotes and semicolons
        .replace(/--/g, '')     // Remove SQL comments
        .replace(/\/\*/g, '')   // Remove multi-line comment start
        .replace(/\*\//g, '')   // Remove multi-line comment end
        .trim();
};

/**
 * Log database operation
 * @param {string} operation - Operation description
 * @param {string} level - Log level (info, warning, error)
 * @param {Object} metadata - Additional metadata
 */
export const logOperation = async (operation, level = 'info', metadata = {}) => {
    try {
        await pool.query(`
            INSERT INTO activity_logs (activity_type, description, level, metadata)
            VALUES ($1, $2, $3, $4)
        `, [operation, `System: ${operation}`, level, JSON.stringify(metadata)]);
    } catch (err) {
        // Don't throw if logging fails - just console log
        console.error('❌ Failed to log operation:', err.message);
    }
};

/**
 * Close database connection pool gracefully
 * @returns {Promise<void>}
 */
export const closeDatabase = async () => {
    try {
        await db.closePool();
        console.log('✅ Database connection pool closed');
    } catch (err) {
        console.error('❌ Error closing database:', err.message);
        throw err;
    }
};

export default {
    withErrorHandling,
    testConnection,
    queryWithRetry,
    batchInsert,
    getDatabaseStats,
    paginate,
    globalSearch,
    backupTable,
    cleanupOldRecords,
    validateRequiredFields,
    sanitizeInput,
    logOperation,
    closeDatabase,
    DatabaseError
};