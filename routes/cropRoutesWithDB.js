import {
    createPlantingRecord,
    getDroughtRisk,
    getFarmDashboardData,
    getPestDiseaseRecords,
    getPlantingCalendar,
    getUserActivityLogs,
    getUserFarmsWithRecords,
    getCropRecommendations,
    getWeatherImpactOnCrops,
    getYieldComparison,
    recordPestDisease,
    updateHarvest
} from '../controllers/cropControllerWithDB.js'

import express from 'express';

const router = express.Router();
router.post('/planting', createPlantingRecord);
router.get('/drought-risk/:farmId', getDroughtRisk);
router.get('/dashboard/:farmId', getFarmDashboardData);
router.get('/pest-disease/:farmId', getPestDiseaseRecords);
router.get('/planting-calendar/:farmId', getPlantingCalendar);
router.get('/user-activity/:userId', getUserActivityLogs);
router.get('/user-farms/:userId', getUserFarmsWithRecords);
router.get('/crop-recommendations/:farmId', getCropRecommendations);
router.get('/weather-impact/:farmId', getWeatherImpactOnCrops);
router.get('/yield-comparison/:farmId', getYieldComparison);
router.post('/pest-disease', recordPestDisease);
router.put('/harvest/:plantingId', updateHarvest);

export default router;