import {
    getDatabaseConfig
}  from "../config/db.js";

// Use singleton instance instead of creating new one
const db = getDatabaseConfig();
const pool = db.getPool();

/**
 * Fetch all weather data from the database
 * @returns {Promise<Array>} Array of weather records
 */
export const fetchWeatherAllFromDB = async () => {
    try {
        const query = `
            SELECT 
                w.*,
                r.name as region_name,
                r.country
            FROM weather_data w
            LEFT JOIN regions r ON w.region_id = r.id
            ORDER BY w.year DESC, w.month DESC
        `;
        const res = await pool.query(query);
        return res.rows;
    } catch (err) {
        console.error("❌ Failed to fetch weather data from DB:", err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Filter weather data by year
 * @param {number} year - Year to filter by
 * @returns {Promise<Array>} Array of weather records for the specified year
 */
export const filterWeatherByYearFromDB = async (year) => {
    try {
        const query = `
            SELECT 
                w.*,
                r.name as region_name
            FROM weather_data w
            LEFT JOIN regions r ON w.region_id = r.id
            WHERE w.year = $1
            ORDER BY w.month
        `;
        const res = await pool.query(query, [year]);
        return res.rows;
    } catch (err) {
        console.error(`❌ Failed to fetch weather data for year ${year}:`, err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Filter weather data by year and month
 * @param {number} year - Year to filter by
 * @param {number} month - Month to filter by (1-12)
 * @returns {Promise<Array>} Array of weather records
 */
export const filterWeatherByMonthFromDB = async (year, month) => {
    try {
        if (month < 1 || month > 12) {
            throw new Error('Month must be between 1 and 12');
        }

        const query = `
            SELECT 
                w.*,
                r.name as region_name
            FROM weather_data w
            LEFT JOIN regions r ON w.region_id = r.id
            WHERE w.year = $1 AND w.month = $2
            ORDER BY r.name
        `;
        const res = await pool.query(query, [year, month]);
        return res.rows;
    } catch (err) {
        console.error(`❌ Failed to fetch weather data for ${year}-${month}:`, err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Filter weather data by region
 * @param {string} regionName - Name of the region
 * @returns {Promise<Array>} Array of weather records for the region
 */
export const filterWeatherByRegionFromDB = async (regionName) => {
    try {
        const query = `
            SELECT 
                w.*,
                r.name as region_name
            FROM weather_data w
            JOIN regions r ON w.region_id = r.id
            WHERE LOWER(r.name) = LOWER($1)
            ORDER BY w.year DESC, w.month DESC
        `;
        const res = await pool.query(query, [regionName]);
        return res.rows;
    } catch (err) {
        console.error(`❌ Failed to fetch weather data for region ${regionName}:`, err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Filter weather data by multiple parameters
 * @param {Object} params - Query parameters
 * @param {number} params.year - Year to filter by
 * @param {string} params.region - Region name to filter by
 * @param {number} params.month - Month to filter by
 * @param {string} params.dataType - Data type ('historical' or 'forecast')
 * @returns {Promise<Array>} Array of weather records matching the filters
 */
export const filterWeatherByParamsFromDB = async ({ year, region, month, dataType }) => {
    try {
        let query = `
            SELECT 
                w.*,
                r.name as region_name
            FROM weather_data w
            LEFT JOIN regions r ON w.region_id = r.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (year) {
            query += ` AND w.year = $${paramIndex++}`;
            params.push(year);
        }
        if (region) {
            query += ` AND LOWER(r.name) = LOWER($${paramIndex++})`;
            params.push(region);
        }
        if (month) {
            if (month < 1 || month > 12) {
                throw new Error('Month must be between 1 and 12');
            }
            query += ` AND w.month = $${paramIndex++}`;
            params.push(month);
        }
        if (dataType) {
            query += ` AND w.data_type = $${paramIndex++}`;
            params.push(dataType);
        }

        query += ` ORDER BY w.year DESC, w.month DESC`;

        const res = await pool.query(query, params);
        return res.rows;
    } catch (err) {
        console.error("❌ Failed to fetch weather data with params:", err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Get annual weather summary for a specific region and year
 * @param {string} regionName - Name of the region
 * @param {number} year - Year to get summary for
 * @returns {Promise<Object>} Annual weather summary
 */
export const getAnnualWeatherSummaryFromDB = async (regionName, year) => {
    try {
        const query = `
            SELECT 
                aws.*,
                r.name as region_name
            FROM annual_weather_summary aws
            JOIN regions r ON aws.region_id = r.id
            WHERE LOWER(r.name) = LOWER($1) AND aws.year = $2
        `;
        const res = await pool.query(query, [regionName, year]);
        return res.rows[0] || null;
    } catch (err) {
        console.error(`❌ Failed to fetch annual summary for ${regionName} ${year}:`, err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Get weather statistics for a region across multiple years
 * @param {string} regionName - Name of the region
 * @param {number} startYear - Start year
 * @param {number} endYear - End year
 * @returns {Promise<Object>} Weather statistics
 */
export const getWeatherStatsFromDB = async (regionName, startYear, endYear) => {
    try {
        const query = `
            SELECT 
                AVG(w.avg_temp_c) as avg_temperature,
                AVG(w.rainfall_mm) as avg_rainfall,
                MIN(w.avg_temp_c) as min_temperature,
                MAX(w.avg_temp_c) as max_temperature,
                SUM(w.rainfall_mm) as total_rainfall,
                COUNT(*) as record_count
            FROM weather_data w
            JOIN regions r ON w.region_id = r.id
            WHERE LOWER(r.name) = LOWER($1)
                AND w.year >= $2 
                AND w.year <= $3
        `;
        const res = await pool.query(query, [regionName, startYear, endYear]);
        return res.rows[0];
    } catch (err) {
        console.error(`❌ Failed to fetch weather stats:`, err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Get climate events for a specific year or year range
 * @param {number} year - Year to query
 * @param {string} eventType - Type of event (optional)
 * @returns {Promise<Array>} Array of climate events
 */
export const getClimateEventsFromDB = async (year, eventType = null) => {
    try {
        let query = `
            SELECT * FROM climate_events 
            WHERE year = $1
        `;
        const params = [year];

        if (eventType) {
            query += ` AND event_type = $2`;
            params.push(eventType);
        }

        query += ` ORDER BY created_at DESC`;

        const res = await pool.query(query, params);
        return res.rows;
    } catch (err) {
        console.error(`❌ Failed to fetch climate events:`, err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};