import express from "express";

import {
    getAllCrops,
    getCropsByName,
    getCropsByRegion,
    getCropsByClimate
    //,getCropsByYield
} from '../controllers/cropController.js';

const router = express.Router();

router.get('/', getAllCrops);
router.get('/name/:crop', getCropsByName);
router.get('/region/:region', getCropsByRegion);
router.get('/climate/:temperature/:rainfall', getCropsByClimate);
//router.get('/yield/:year/:region', getCropsByYield);

export default router;