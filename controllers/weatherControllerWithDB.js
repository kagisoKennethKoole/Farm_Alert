import {
    fetchWeatherAllFromDB,
    filterWeatherByYearFromDB,
    filterWeatherByMonthFromDB,
    filterWeatherByParamsFromDB,
    filterWeatherByRegionFromDB,
    getAnnualWeatherSummaryFromDB,
    getClimateEventsFromDB,
    getWeatherStatsFromDB
} from '../services/weatherServiceWithDB.js'

/**
 * Get all weather data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllWeatherData = async (req, res) => {
    try {
        const data = await fetchWeatherAllFromDB();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get weather data filtered by year
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} req.params.year - Year to filter by
 * @returns {Promise<void>}
 */
export const getWeatherByYear = async (req, res) => {
    const { year } = req.params;
    try {
        const data = await filterWeatherByYearFromDB(year);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/**
 * Get weather data filtered by year and month
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} req.params.year - Year to filter by
 * @param {number} req.params.month - Month to filter by (1-12)
 * @returns {Promise<void>}
 */
export const getWeatherByMonth = async (req, res) => {
    const { year, month } = req.params;
    try {
        const data = await filterWeatherByMonthFromDB(year, month);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/**
 * Get weather data filtered by various parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} [req.query.year] - Year to filter by
 * @param {string} [req.query.region] - Region to filter by
 * @param {number} [req.query.month] - Month to filter by (1-12)
 * @returns {Promise<void>}
 * 
 * */
export const getWeatherByParams = async (req, res) => {
    const { year, region, month } = req.query;
    try {
        const data = await filterWeatherByParamsFromDB({ year, region, month });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get weather data filtered by region
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.region - Name of the region
 * @returns {Promise<void>}
 */
export const getWeatherByRegion = async (req, res) => {
    const { region } = req.params;
    try {
        const data = await filterWeatherByRegionFromDB(region);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get annual weather summary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} req.params.year - Year to summarize
 * @returns {Promise<void>}
 */
export const getAnnualWeatherSummary = async (req, res) => {
    const { year } = req.params;
    try {
        const data = await getAnnualWeatherSummaryFromDB(year);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/**
 * Get climate events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.region - Name of the region
 * @param {number} req.params.year - Year to filter by
 * @returns {Promise<void>}
 */
export const getClimateEvents = async (req, res) => {
    const { region, year } = req.params;
    try {
        const data = await getClimateEventsFromDB(region, year);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};

/**
 * Get weather statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.region - Name of the region
 * @param {number} req.params.startYear - Start year
 * @param {number} req.params.endYear - End year
 * @returns {Promise<void>}
 **/
export const getWeatherStats = async (req, res) => {
    const { region, startYear, endYear } = req.params;
    try {
        const data = await getWeatherStatsFromDB(region, startYear, endYear);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};