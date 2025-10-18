import express from 'express';
import {
    getAllWeatherData,
    getWeatherByYear,
    getAnnualWeatherSummary,
    getWeatherByMonth,
    getWeatherByParams,
    getClimateEvents,
    getWeatherByRegion,
    getWeatherStats
} from '../controllers/weatherControllerWithDB.js';

const router = express.Router();

router.get('/', getAllWeatherData);
router.get('/year/:year', getWeatherByYear);
router.get('/year/:year/summary', getAnnualWeatherSummary);
router.get('/year/:year/month/:month', getWeatherByMonth);
router.get('/filter', getWeatherByParams);
router.get('/region/:region', getWeatherByRegion);
router.get('/region/:region/year/:year/climate-events', getClimateEvents);
router.get('/stats', getWeatherStats);

export default router;
