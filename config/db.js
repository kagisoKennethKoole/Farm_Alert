import pkg from 'pg';
const { Pool } = pkg;

class DatabaseConfig {
    constructor() {
        // Check if running on Vercel
        const isVercel = process.env.VERCEL || process.env.POSTGRES_URL;
        
        if (isVercel && process.env.POSTGRES_URL) {
            // Use Vercel Postgres connection string
            this.pool = new Pool({
                connectionString: process.env.POSTGRES_URL,
                ssl: {
                    rejectUnauthorized: false
                }
            });
            this.isVercel = true;
            console.log('🚀 Using Vercel Postgres connection');
        } else {
            // For local development with standard PostgreSQL
            this.config = {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT) || 5432,
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'password',
                database: process.env.DB_NAME || 'agricultural_db',
                max: 20, // Maximum pool size
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            };
            this.pool = new Pool(this.config);
            this.isVercel = false;
            console.log('💻 Using local PostgreSQL connection');
        }

        // Handle pool errors
        this.pool.on('error', (err) => {
            console.error('❌ Unexpected error on idle client', err);
        });
    }

    getPool() {
        return this.pool;
    }

    async closePool() {
        if (this.pool) {
            await this.pool.end();
            console.log('🔌 Database connection pool closed');
        }
    }

    // Helper method to execute queries
    async query(text, params) {
        const start = Date.now();
        try {
            const res = await this.pool.query(text, params);
            const duration = Date.now() - start;
            console.log('✅ Query executed', { duration, rows: res.rowCount });
            return res;
        } catch (error) {
            console.error('❌ Query error', { text, error: error.message });
            throw error;
        }
    }
}

// Singleton instance
let dbInstance = null;

function getDatabaseConfig() {
    if (!dbInstance) {
        dbInstance = new DatabaseConfig();
    }
    return dbInstance;
}

// Enhanced table creation with proper schema
async function createTables() {
    const database = getDatabaseConfig();
    const pool = database.getPool();
    
    let client;
    try {
        client = await pool.connect();
        console.log('📊 Starting table creation...');
        
        await client.query('BEGIN');

        // Users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'farmer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        `);
        console.log('✅ Users table created');

        // Regions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS regions (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                country VARCHAR(100) DEFAULT 'South Africa',
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        await client.query(`
            INSERT INTO regions (name) VALUES 
                ('Gauteng'), ('Western Cape'), ('KwaZulu-Natal'), 
                ('Free State'), ('Mpumalanga'), ('Limpopo')
            ON CONFLICT (name) DO NOTHING;
        `);
        console.log('✅ Regions table created');

        // Weather data table
        await client.query(`
            CREATE TABLE IF NOT EXISTS weather_data (
                id SERIAL PRIMARY KEY,
                region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE,
                year INTEGER NOT NULL,
                month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
                avg_temp_c NUMERIC(5, 2) NOT NULL,
                rainfall_mm NUMERIC(7, 2) NOT NULL,
                humidity_percent NUMERIC(5, 2),
                sunshine_hours NUMERIC(4, 2),
                frost_days INTEGER DEFAULT 0,
                data_type VARCHAR(20) DEFAULT 'historical' CHECK (data_type IN ('historical', 'forecast')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(region_id, year, month, data_type)
            );
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_weather_region_year ON weather_data(region_id, year);
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_weather_date ON weather_data(year, month);
        `);
        console.log('✅ Weather data table created');

        // Annual weather summary
        await client.query(`
            CREATE TABLE IF NOT EXISTS annual_weather_summary (
                id SERIAL PRIMARY KEY,
                region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE,
                year INTEGER NOT NULL,
                total_rainfall_mm NUMERIC(7, 2) NOT NULL,
                avg_annual_temp_c NUMERIC(5, 2) NOT NULL,
                drought_risk VARCHAR(20) CHECK (drought_risk IN ('low', 'moderate', 'high', 'severe')),
                growing_season_length_days INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(region_id, year)
            );
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_annual_summary_region ON annual_weather_summary(region_id);
        `);
        console.log('✅ Annual weather summary table created');

        // Crops master table
        await client.query(`
            CREATE TABLE IF NOT EXISTS crops_master (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                planting_season VARCHAR(50),
                harvest_season VARCHAR(50),
                optimal_temp_min NUMERIC(5, 2),
                optimal_temp_max NUMERIC(5, 2),
                optimal_rainfall_min NUMERIC(7, 2),
                optimal_rainfall_max NUMERIC(7, 2),
                optimal_soil_ph_min NUMERIC(3, 1),
                optimal_soil_ph_max NUMERIC(3, 1),
                growing_days INTEGER,
                yield_per_hectare_tons NUMERIC(6, 2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Crops master table created');

        // Crop-Region suitability
        await client.query(`
            CREATE TABLE IF NOT EXISTS crop_region_suitability (
                id SERIAL PRIMARY KEY,
                crop_id INTEGER REFERENCES crops_master(id) ON DELETE CASCADE,
                region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE,
                suitability_score INTEGER CHECK (suitability_score BETWEEN 1 AND 10),
                notes TEXT,
                UNIQUE(crop_id, region_id)
            );
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_suitability_crop ON crop_region_suitability(crop_id);
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_suitability_region ON crop_region_suitability(region_id);
        `);
        console.log('✅ Crop-Region suitability table created');

        // User farms/fields
        await client.query(`
            CREATE TABLE IF NOT EXISTS farms (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                region_id INTEGER REFERENCES regions(id),
                size_hectares NUMERIC(10, 2),
                soil_type VARCHAR(50),
                soil_ph NUMERIC(3, 1),
                irrigation_available BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_farms_user ON farms(user_id);
        `);
        console.log('✅ Farms table created');

        // Planting records
        await client.query(`
            CREATE TABLE IF NOT EXISTS planting_records (
                id SERIAL PRIMARY KEY,
                farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
                crop_id INTEGER REFERENCES crops_master(id),
                planted_date DATE NOT NULL,
                expected_harvest_date DATE,
                actual_harvest_date DATE,
                area_hectares NUMERIC(10, 2),
                yield_tons NUMERIC(10, 2),
                notes TEXT,
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'harvested', 'failed')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_planting_farm ON planting_records(farm_id);
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_planting_dates ON planting_records(planted_date, expected_harvest_date);
        `);
        console.log('✅ Planting records table created');

        // Pest and disease records
        await client.query(`
            CREATE TABLE IF NOT EXISTS pest_disease_records (
                id SERIAL PRIMARY KEY,
                planting_record_id INTEGER REFERENCES planting_records(id) ON DELETE CASCADE,
                type VARCHAR(20) CHECK (type IN ('pest', 'disease')),
                name VARCHAR(100) NOT NULL,
                severity VARCHAR(20) CHECK (severity IN ('low', 'moderate', 'high', 'severe')),
                detected_date DATE NOT NULL,
                treatment_applied TEXT,
                resolved BOOLEAN DEFAULT false,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_pest_disease_planting ON pest_disease_records(planting_record_id);
        `);
        console.log('✅ Pest and disease records table created');

        // Cultivation methods
        await client.query(`
            CREATE TABLE IF NOT EXISTS cultivation_methods (
                id SERIAL PRIMARY KEY,
                crop_id INTEGER REFERENCES crops_master(id) ON DELETE CASCADE,
                soil_preparation TEXT,
                planting_depth_cm NUMERIC(5, 2),
                row_spacing_cm NUMERIC(6, 2),
                plant_spacing_cm NUMERIC(6, 2),
                irrigation_method VARCHAR(50),
                irrigation_amount_mm NUMERIC(7, 2),
                fertilizer_recommendation TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(crop_id)
            );
        `);
        console.log('✅ Cultivation methods table created');

        // Activity logs
        await client.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                farm_id INTEGER REFERENCES farms(id) ON DELETE SET NULL,
                activity_type VARCHAR(50) NOT NULL,
                description TEXT NOT NULL,
                level VARCHAR(20) DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error', 'critical')),
                metadata JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_logs_user ON activity_logs(user_id);
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_logs_type ON activity_logs(activity_type);
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_logs_created ON activity_logs(created_at DESC);
        `);
        console.log('✅ Activity logs table created');

        // Climate events
        await client.query(`
            CREATE TABLE IF NOT EXISTS climate_events (
                id SERIAL PRIMARY KEY,
                year INTEGER NOT NULL,
                event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('el_nino', 'la_nina', 'drought', 'flood', 'above_average_rainfall')),
                severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe')),
                regions_affected TEXT[],
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_climate_year ON climate_events(year);
        `);
        console.log('✅ Climate events table created');

        await client.query('COMMIT');
        console.log('🎉 All tables created successfully!');
        
        return { success: true, message: 'All tables created successfully' };
    } catch (err) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error('❌ Error creating tables:', err);
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
}

// Helper function to insert initial crop data
async function seedCropData() {
    const database = getDatabaseConfig();
    const pool = database.getPool();
    
    let client;
    try {
        client = await pool.connect();
        console.log('🌱 Starting crop data seeding...');
        
        const crops = [
            ['Maize (Corn)', 'October - December', 'April - June', 18, 32, 500, 800, 5.8, 7.0, 120, 5.5],
            ['Wheat', 'May - July', 'November - December', 12, 25, 375, 625, 6.0, 7.5, 120, 3.2],
            ['Sugarcane', 'August - March', 'May - November', 20, 35, 1000, 1500, 5.5, 7.5, 365, 65],
            ['Soybeans', 'November - December', 'April - May', 20, 30, 450, 700, 6.0, 7.0, 110, 2.0],
            ['Sunflower', 'October - December', 'March - May', 20, 30, 400, 650, 6.0, 7.5, 100, 1.8],
            ['Potatoes', 'Year-round', '90-120 days', 15, 24, 500, 700, 5.2, 6.5, 100, 35],
            ['Tomatoes', 'August - March', '90-120 days', 18, 27, 600, 1000, 6.0, 7.0, 100, 55],
            ['Grapes (Wine)', 'July - September', 'January - March', 15, 30, 400, 800, 6.0, 7.5, 365, 12]
        ];

        let insertedCount = 0;
        for (const crop of crops) {
            const result = await client.query(`
                INSERT INTO crops_master (
                    name, planting_season, harvest_season, 
                    optimal_temp_min, optimal_temp_max,
                    optimal_rainfall_min, optimal_rainfall_max,
                    optimal_soil_ph_min, optimal_soil_ph_max,
                    growing_days, yield_per_hectare_tons
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (name) DO NOTHING
                RETURNING id
            `, crop);
            
            if (result.rowCount > 0) {
                insertedCount++;
            }
        }

        console.log(`✅ Crop data seeded successfully! (${insertedCount} new crops added)`);
        return { success: true, inserted: insertedCount, total: crops.length };
    } catch (err) {
        console.error('❌ Error seeding crop data:', err);
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
}

// Test connection function
async function testConnection() {
    try {
        const database = getDatabaseConfig();
        const pool = database.getPool();
        const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✅ Database connected successfully!');
        console.log('📅 Server time:', result.rows[0].current_time);
        console.log('🐘 PostgreSQL version:', result.rows[0].pg_version.split(',')[0]);
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        return false;
    }
}

export {
    DatabaseConfig,
    getDatabaseConfig,
    createTables,
    seedCropData,
    testConnection
};