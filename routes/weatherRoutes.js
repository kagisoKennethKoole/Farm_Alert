import express from "express";
import {
  getAllWeather,
  getByYear,
  getByMonth,
  getByDay,
  searchWeather
} from "../controllers/weatherController.js";

const router = express.Router();

router.get("/", getAllWeather);
router.get("/search", searchWeather);

router.get("/:year",getByYear);
router.get("/:year/:month", getByMonth);
router.get("/:year/:month/:day", getByDay);


export default router;
