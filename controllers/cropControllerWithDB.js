import {
    getCropRecommendationsFromDB,
    createPlantingRecordInDB,
    getDroughtRiskFromDB,
    getFarmDashboardDataFromDB,
    getPestDiseaseRecordsFromDB,
    getPlantingCalendarFromDB,
    getUserActivityLogsFromDB,
    getUserFarmsWithRecordsFromDB,
    getWeatherImpactOnCropsFromDB,
    getYieldComparisonFromDB,
    recordPestDiseaseInDB,
    updateHarvestInDB
} from '../services/cropServiceWithDB.js';

/**
 * Get crop recommendations based on soil and weather data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCropRecommendations = async (req, res) => {
    const { soilType, pH, nutrients, weatherParams } = req.body;
    try {
        const recommendations = await getCropRecommendationsFromDB(soilType, pH, nutrients, weatherParams);
        res.status(200).json(recommendations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/**
 * Create a new planting record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} req.body - Planting record details
 */
export const createPlantingRecord = async (req, res) => {
    const recordDetails = req.body;
    try {
        const newRecord = await createPlantingRecordInDB(recordDetails);
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/**
 * Get drought risk assessment for a region
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.region - Region to assess
 */
export const getDroughtRisk = async (req, res) => {
    const { region } = req.params;
    try {
        const riskData = await getDroughtRiskFromDB(region);
        res.status(200).json(riskData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/**
 * Get farm dashboard data including recent activities and alerts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} req.params.farmId - ID of the farm
 */
export const getFarmDashboardData = async (req, res) => {
    const { farmId } = req.params;
    try {
        const dashboardData = await getFarmDashboardDataFromDB(farmId);
        res.status(200).json(dashboardData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/**
 * Get pest and disease records for a farm
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} req.params.farmId - ID of the farm
 **/
export const getPestDiseaseRecords = async (req, res) => {
    const { farmId } = req.params;
    try {
        const records = await getPestDiseaseRecordsFromDB(farmId);
        res.status(200).json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/**
 * Get planting calendar for a farm
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} req.params.farmId - ID of the farm
 */
export const getPlantingCalendar = async (req, res) => {
    const { farmId } = req.params;
    try {
        const calendar = await getPlantingCalendarFromDB(farmId);
        res.status(200).json(calendar);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/**
 * Get user activity logs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} req.params.userId - ID of the user
 **/
export const getUserActivityLogs = async (req, res) => {
    const { userId } = req.params;
    try {
        const logs = await getUserActivityLogsFromDB(userId);
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/**
 * Get user's farms with associated records
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} req.params.userId - ID of the user
 * */
export const getUserFarmsWithRecords = async (req, res) => {
    const { userId } = req.params;
    try {
        const farms = await getUserFarmsWithRecordsFromDB(userId);
        res.status(200).json(farms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/**
 * Get weather impact on crops for a farm
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} req.params.farmId - ID of the farm
 */
export const getWeatherImpactOnCrops = async (req, res) => {
    const { farmId } = req.params;
    try {
        const impactData = await getWeatherImpactOnCropsFromDB(farmId);
        res.status(200).json(impactData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/**
 * Get yield comparison across seasons for a farm
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} req.params.farmId - ID of the farm
 **/
export const getYieldComparison = async (req, res) => {
    const { farmId } = req.params;
    try {
        const comparisonData = await getYieldComparisonFromDB(farmId);
        res.status(200).json(comparisonData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/**
 * Record a new pest or disease incident
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} req.body - Pest/Disease record details
 */
export const recordPestDisease = async (req, res) => {
    const recordDetails = req.body;
    try {
        const newRecord = await recordPestDiseaseInDB(recordDetails);
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/**
 * Update harvest information for a planting record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} req.params.recordId - ID of the planting record
 * @param {Object} req.body - Harvest details to update
 **/
export const updateHarvest = async (req, res) => {
    const { recordId } = req.params;
    const harvestDetails = req.body;
    try {
        const updatedRecord = await updateHarvestInDB(recordId, harvestDetails);
        res.status(200).json(updatedRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};