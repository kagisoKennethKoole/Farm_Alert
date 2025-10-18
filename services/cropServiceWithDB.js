import { getDatabaseConfig } from "../config/db.js";

const db = getDatabaseConfig();
const pool = db.getPool();

/**
 * Get crop recommendations based on region and current conditions
 * @param {string} regionName - Name of the region
 * @param {number} year - Current year
 * @param {number} month - Current month
 * @returns {Promise<Array>} Array of recommended crops with suitability scores
 */
export const getCropRecommendationsFromDB = async (regionName, year, month) => {
    try {
        const query = `
            WITH region_weather AS (
                SELECT 
                    AVG(wd.avg_temp_c) as avg_temp,
                    SUM(wd.rainfall_mm) as total_rainfall,
                    AVG(wd.humidity_percent) as avg_humidity
                FROM weather_data wd
                JOIN regions r ON wd.region_id = r.id
                WHERE LOWER(r.name) = LOWER($1)
                    AND wd.year = $2
                    AND wd.month <= $3
            )
            SELECT 
                cm.*,
                crs.suitability_score as region_score,
                rw.avg_temp,
                rw.total_rainfall,
                rw.avg_humidity,
                CASE 
                    WHEN rw.avg_temp BETWEEN cm.optimal_temp_min AND cm.optimal_temp_max 
                        AND rw.total_rainfall BETWEEN cm.optimal_rainfall_min AND cm.optimal_rainfall_max
                    THEN 'Excellent'
                    WHEN rw.avg_temp BETWEEN cm.optimal_temp_min - 3 AND cm.optimal_temp_max + 3
                        AND rw.total_rainfall BETWEEN cm.optimal_rainfall_min * 0.8 AND cm.optimal_rainfall_max * 1.2
                    THEN 'Good'
                    WHEN rw.avg_temp BETWEEN cm.optimal_temp_min - 5 AND cm.optimal_temp_max + 5
                        AND rw.total_rainfall BETWEEN cm.optimal_rainfall_min * 0.7 AND cm.optimal_rainfall_max * 1.3
                    THEN 'Fair'
                    ELSE 'Poor'
                END as climate_suitability
            FROM crops_master cm
            JOIN crop_region_suitability crs ON cm.id = crs.crop_id
            JOIN regions r ON crs.region_id = r.id
            CROSS JOIN region_weather rw
            WHERE LOWER(r.name) = LOWER($1)
            ORDER BY 
                crs.suitability_score DESC,
                CASE climate_suitability
                    WHEN 'Excellent' THEN 1
                    WHEN 'Good' THEN 2
                    WHEN 'Fair' THEN 3
                    ELSE 4
                END
            LIMIT 10
        `;
        const res = await pool.query(query, [regionName, year, month]);
        return res.rows;
    } catch (err) {
        console.error("❌ Failed to get crop recommendations:", err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Get planting calendar for a specific region
 * @param {string} regionName - Name of the region
 * @returns {Promise<Array>} Array of crops with planting windows
 */
export const getPlantingCalendarFromDB = async (regionName) => {
    try {
        const query = `
            SELECT 
                cm.name,
                cm.planting_season,
                cm.harvest_season,
                cm.growing_days,
                crs.suitability_score,
                cm.optimal_temp_min,
                cm.optimal_temp_max,
                cm.optimal_rainfall_min,
                cm.optimal_rainfall_max
            FROM crops_master cm
            JOIN crop_region_suitability crs ON cm.id = crs.crop_id
            JOIN regions r ON crs.region_id = r.id
            WHERE LOWER(r.name) = LOWER($1)
                AND crs.suitability_score >= 6
            ORDER BY cm.planting_season, cm.name
        `;
        const res = await pool.query(query, [regionName]);
        return res.rows;
    } catch (err) {
        console.error("❌ Failed to get planting calendar:", err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Get farm records with current planting status
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of farms with planting records
 */
export const getUserFarmsWithRecordsFromDB = async (userId) => {
    try {
        const query = `
            SELECT 
                f.*,
                r.name as region_name,
                COUNT(pr.id) as active_plantings,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', pr.id,
                            'crop_name', cm.name,
                            'planted_date', pr.planted_date,
                            'expected_harvest_date', pr.expected_harvest_date,
                            'area_hectares', pr.area_hectares,
                            'status', pr.status
                        )
                    ) FILTER (WHERE pr.id IS NOT NULL AND pr.status = 'active'),
                    '[]'
                ) as current_plantings
            FROM farms f
            LEFT JOIN regions r ON f.region_id = r.id
            LEFT JOIN planting_records pr ON f.id = pr.farm_id
            LEFT JOIN crops_master cm ON pr.crop_id = cm.id
            WHERE f.user_id = $1
            GROUP BY f.id, r.name
            ORDER BY f.name
        `;
        const res = await pool.query(query, [userId]);
        return res.rows;
    } catch (err) {
        console.error("❌ Failed to get user farms:", err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Create a new planting record
 * @param {Object} plantingData - Planting record data
 * @returns {Promise<Object>} Created planting record
 */
export const createPlantingRecordInDB = async (plantingData) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const query = `
            INSERT INTO planting_records (
                farm_id, crop_id, planted_date, expected_harvest_date,
                area_hectares, notes, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const values = [
            plantingData.farm_id,
            plantingData.crop_id,
            plantingData.planted_date,
            plantingData.expected_harvest_date,
            plantingData.area_hectares,
            plantingData.notes || null,
            plantingData.status || 'active'
        ];

        const res = await client.query(query, values);

        // Log the activity
        await client.query(`
            INSERT INTO activity_logs (user_id, farm_id, activity_type, description, level)
            VALUES (
                (SELECT user_id FROM farms WHERE id = $1),
                $1,
                'planting',
                'New planting record created',
                'info'
            )
        `, [plantingData.farm_id]);

        await client.query('COMMIT');
        return res.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Failed to create planting record:", err.message);
        throw new Error(`Database insert failed: ${err.message}`);
    } finally {
        client.release();
    }
};

/**
 * Update harvest information
 * @param {number} plantingId - Planting record ID
 * @param {Object} harvestData - Harvest data
 * @returns {Promise<Object>} Updated planting record
 */
export const updateHarvestInDB = async (plantingId, harvestData) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const query = `
            UPDATE planting_records
            SET 
                actual_harvest_date = $1,
                yield_tons = $2,
                status = 'harvested',
                notes = COALESCE($3, notes),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `;
        
        const values = [
            harvestData.actual_harvest_date,
            harvestData.yield_tons,
            harvestData.notes,
            plantingId
        ];

        const res = await client.query(query, values);

        // Log the harvest activity
        await client.query(`
            INSERT INTO activity_logs (user_id, farm_id, activity_type, description, level)
            VALUES (
                (SELECT user_id FROM farms WHERE id = (SELECT farm_id FROM planting_records WHERE id = $1)),
                (SELECT farm_id FROM planting_records WHERE id = $1),
                'harvest',
                'Crop harvested: ' || $2 || ' tons',
                'info'
            )
        `, [plantingId, harvestData.yield_tons]);

        await client.query('COMMIT');
        return res.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Failed to update harvest:", err.message);
        throw new Error(`Database update failed: ${err.message}`);
    } finally {
        client.release();
    }
};

/**
 * Get pest and disease records for a planting
 * @param {number} plantingId - Planting record ID
 * @returns {Promise<Array>} Array of pest/disease records
 */
export const getPestDiseaseRecordsFromDB = async (plantingId) => {
    try {
        const query = `
            SELECT *
            FROM pest_disease_records
            WHERE planting_record_id = $1
            ORDER BY detected_date DESC
        `;
        const res = await pool.query(query, [plantingId]);
        return res.rows;
    } catch (err) {
        console.error("❌ Failed to get pest/disease records:", err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Record a pest or disease incident
 * @param {Object} incidentData - Incident data
 * @returns {Promise<Object>} Created incident record
 */
export const recordPestDiseaseInDB = async (incidentData) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const query = `
            INSERT INTO pest_disease_records (
                planting_record_id, type, name, severity,
                detected_date, treatment_applied, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const values = [
            incidentData.planting_record_id,
            incidentData.type,
            incidentData.name,
            incidentData.severity,
            incidentData.detected_date,
            incidentData.treatment_applied || null,
            incidentData.notes || null
        ];

        const res = await client.query(query, values);

        // Log the incident
        await client.query(`
            INSERT INTO activity_logs (user_id, farm_id, activity_type, description, level)
            VALUES (
                (SELECT user_id FROM farms WHERE id = (SELECT farm_id FROM planting_records WHERE id = $1)),
                (SELECT farm_id FROM planting_records WHERE id = $1),
                $2,
                $3 || ' detected: ' || $4,
                CASE 
                    WHEN $5 IN ('severe', 'high') THEN 'warning'
                    ELSE 'info'
                END
            )
        `, [
            incidentData.planting_record_id,
            incidentData.type,
            incidentData.type,
            incidentData.name,
            incidentData.severity
        ]);

        await client.query('COMMIT');
        return res.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Failed to record pest/disease:", err.message);
        throw new Error(`Database insert failed: ${err.message}`);
    } finally {
        client.release();
    }
};

/**
 * Get yield comparison across years for a crop
 * @param {number} cropId - Crop ID
 * @param {number} farmId - Farm ID (optional)
 * @returns {Promise<Array>} Array of yield records
 */
export const getYieldComparisonFromDB = async (cropId, farmId = null) => {
    try {
        let query = `
            SELECT 
                EXTRACT(YEAR FROM pr.planted_date) as year,
                cm.name as crop_name,
                AVG(pr.yield_tons) as avg_yield,
                COUNT(*) as harvest_count,
                SUM(pr.area_hectares) as total_area,
                AVG(pr.yield_tons / NULLIF(pr.area_hectares, 0)) as yield_per_hectare
            FROM planting_records pr
            JOIN crops_master cm ON pr.crop_id = cm.id
            WHERE pr.crop_id = $1 
                AND pr.status = 'harvested'
                AND pr.yield_tons IS NOT NULL
        `;
        const params = [cropId];

        if (farmId) {
            query += ` AND pr.farm_id = $2`;
            params.push(farmId);
        }

        query += `
            GROUP BY EXTRACT(YEAR FROM pr.planted_date), cm.name
            ORDER BY year DESC
        `;

        const res = await pool.query(query, params);
        return res.rows;
    } catch (err) {
        console.error("❌ Failed to get yield comparison:", err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Get drought risk assessment for a region
 * @param {string} regionName - Name of the region
 * @param {number} year - Year to assess
 * @returns {Promise<Object>} Drought risk assessment
 */
export const getDroughtRiskFromDB = async (regionName, year) => {
    try {
        const query = `
            WITH current_year AS (
                SELECT 
                    SUM(rainfall_mm) as total_rainfall,
                    AVG(avg_temp_c) as avg_temp
                FROM weather_data wd
                JOIN regions r ON wd.region_id = r.id
                WHERE LOWER(r.name) = LOWER($1)
                    AND wd.year = $2
            ),
            historical_avg AS (
                SELECT 
                    AVG(total_rainfall_mm) as avg_rainfall,
                    AVG(avg_annual_temp_c) as avg_temp
                FROM annual_weather_summary aws
                JOIN regions r ON aws.region_id = r.id
                WHERE LOWER(r.name) = LOWER($1)
                    AND aws.year < $2
                    AND aws.year >= $2 - 10
            )
            SELECT 
                cy.total_rainfall as current_rainfall,
                ha.avg_rainfall as historical_avg_rainfall,
                cy.avg_temp as current_temp,
                ha.avg_temp as historical_avg_temp,
                ROUND((cy.total_rainfall / NULLIF(ha.avg_rainfall, 0) * 100)::numeric, 2) as rainfall_percentage,
                CASE 
                    WHEN cy.total_rainfall < ha.avg_rainfall * 0.5 THEN 'severe'
                    WHEN cy.total_rainfall < ha.avg_rainfall * 0.7 THEN 'high'
                    WHEN cy.total_rainfall < ha.avg_rainfall * 0.85 THEN 'moderate'
                    ELSE 'low'
                END as drought_risk
            FROM current_year cy
            CROSS JOIN historical_avg ha
        `;
        const res = await pool.query(query, [regionName, year]);
        return res.rows[0] || null;
    } catch (err) {
        console.error("❌ Failed to get drought risk:", err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Get activity logs for a user
 * @param {number} userId - User ID
 * @param {number} limit - Number of records to return
 * @returns {Promise<Array>} Array of activity logs
 */
export const getUserActivityLogsFromDB = async (userId, limit = 50) => {
    try {
        const query = `
            SELECT 
                al.*,
                f.name as farm_name
            FROM activity_logs al
            LEFT JOIN farms f ON al.farm_id = f.id
            WHERE al.user_id = $1
            ORDER BY al.created_at DESC
            LIMIT $2
        `;
        const res = await pool.query(query, [userId, limit]);
        return res.rows;
    } catch (err) {
        console.error("❌ Failed to get activity logs:", err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Get comprehensive farm dashboard data
 * @param {number} farmId - Farm ID
 * @returns {Promise<Object>} Dashboard data
 */
export const getFarmDashboardDataFromDB = async (farmId) => {
    try {
        const query = `
            WITH farm_info AS (
                SELECT 
                    f.*,
                    r.name as region_name
                FROM farms f
                LEFT JOIN regions r ON f.region_id = r.id
                WHERE f.id = $1
            ),
            active_crops AS (
                SELECT 
                    COUNT(*) as count,
                    SUM(area_hectares) as total_area
                FROM planting_records
                WHERE farm_id = $1 AND status = 'active'
            ),
            recent_harvests AS (
                SELECT 
                    cm.name as crop_name,
                    pr.actual_harvest_date,
                    pr.yield_tons,
                    pr.area_hectares
                FROM planting_records pr
                JOIN crops_master cm ON pr.crop_id = cm.id
                WHERE pr.farm_id = $1 
                    AND pr.status = 'harvested'
                ORDER BY pr.actual_harvest_date DESC
                LIMIT 5
            ),
            pest_issues AS (
                SELECT COUNT(*) as count
                FROM pest_disease_records pdr
                JOIN planting_records pr ON pdr.planting_record_id = pr.id
                WHERE pr.farm_id = $1 
                    AND pdr.resolved = false
            )
            SELECT 
                json_build_object(
                    'farm', (SELECT row_to_json(fi) FROM farm_info fi),
                    'active_plantings', (SELECT row_to_json(ac) FROM active_crops ac),
                    'recent_harvests', (SELECT json_agg(rh) FROM recent_harvests rh),
                    'pending_issues', (SELECT count FROM pest_issues)
                ) as dashboard
        `;
        const res = await pool.query(query, [farmId]);
        return res.rows[0]?.dashboard || null;
    } catch (err) {
        console.error("❌ Failed to get dashboard data:", err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};

/**
 * Get weather forecast impact on crops
 * @param {string} regionName - Name of the region
 * @param {number} farmId - Farm ID
 * @returns {Promise<Array>} Impact assessment for active crops
 */
export const getWeatherImpactOnCropsFromDB = async (regionName, farmId) => {
    try {
        const query = `
            WITH forecast_weather AS (
                SELECT 
                    AVG(wd.avg_temp_c) as forecast_temp,
                    SUM(wd.rainfall_mm) as forecast_rainfall
                FROM weather_data wd
                JOIN regions r ON wd.region_id = r.id
                WHERE LOWER(r.name) = LOWER($1)
                    AND wd.data_type = 'forecast'
                    AND wd.year = EXTRACT(YEAR FROM CURRENT_DATE)
                    AND wd.month >= EXTRACT(MONTH FROM CURRENT_DATE)
            )
            SELECT 
                cm.name as crop_name,
                pr.planted_date,
                pr.expected_harvest_date,
                pr.area_hectares,
                fw.forecast_temp,
                fw.forecast_rainfall,
                cm.optimal_temp_min,
                cm.optimal_temp_max,
                cm.optimal_rainfall_min,
                cm.optimal_rainfall_max,
                CASE 
                    WHEN fw.forecast_temp < cm.optimal_temp_min 
                        THEN 'Temperature too low - risk of stunted growth'
                    WHEN fw.forecast_temp > cm.optimal_temp_max 
                        THEN 'Temperature too high - risk of heat stress'
                    ELSE 'Temperature within optimal range'
                END as temp_warning,
                CASE 
                    WHEN fw.forecast_rainfall < cm.optimal_rainfall_min 
                        THEN 'Insufficient rainfall - irrigation recommended'
                    WHEN fw.forecast_rainfall > cm.optimal_rainfall_max 
                        THEN 'Excessive rainfall - ensure good drainage'
                    ELSE 'Rainfall within optimal range'
                END as rainfall_warning
            FROM planting_records pr
            JOIN crops_master cm ON pr.crop_id = cm.id
            CROSS JOIN forecast_weather fw
            WHERE pr.farm_id = $2
                AND pr.status = 'active'
            ORDER BY pr.expected_harvest_date
        `;
        const res = await pool.query(query, [regionName, farmId]);
        return res.rows;
    } catch (err) {
        console.error("❌ Failed to get weather impact:", err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
};