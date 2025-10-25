// controllers/weatherController.js
/*import {
  fetchWeatherAll ,
  filterWeatherByYear,
  filterWeatherByMonth,
  filterWeatherByDay,
  filterWeatherByParams,
  filterWeatherByRegion
} from "../services/weatherService.js";
*/ // Updated import to include all service functions
import * as weatherService from '../services/weatherService.js';


export const getAllWeather = (req, res) => {
  const data = weatherService.fetchWeatherAll();
  res.json(data);
};

export const getByYear = (req, res) => {
  const { year } = req.params;
  const data = weatherService.filterWeatherByYear(year);
  res.json(data);
};

export const getByMonth = (req, res) => {
  const { year, month } = req.params;
  const data = weatherService.filterWeatherByMonth(year, month);
  res.json(data);
};

/*export const getByDay = (req, res) => {
  const { year, month, day } = req.params;
  const data = filterWeatherByDay(year, month, day);
  res.json(data);
};
*/
export const searchWeather = (req, res) => {
  const {  year, region, month } = req.params;
  const data = weatherService.filterWeatherByParams({ year, region, month });
  res.json(data);
  console.log('search params:',{ year, region, month });
};

export const getByRegion = (req, res) => {
  const { region } = req.params;
  console.log('region param:',region);
  const data = weatherService.filterWeatherByRegion(region);
  res.json(data);
};

// Get all 7-day forecasts
export const getAllForecasts = (req, res) => {
  try {
    const data = weatherService.getAllForecasts();
    res.json({ 
      success: true, 
      count: data.length,
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get forecast by region
export const getForecastByRegion = (req, res) => {
  try {
    const { region } = req.params;
    const data = weatherService.getForecastByRegion(region);
    
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: `No forecast found for region: ${region}` 
      });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get forecast by region and date
export const getForecastByDate = (req, res) => {
  try {
    const { region, date } = req.params;
    const data = weatherService.getForecastByDate(region, date);
    
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: `No forecast found for ${region} on ${date}` 
      });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get week summaries
export const getWeekSummaries = (req, res) => {
  try {
    const data = weatherService.getWeekSummaries();
    res.json({ 
      success: true,
      count: data.length, 
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get regional comparison
export const getRegionalComparison = (req, res) => {
  try {
    const data = weatherService.getRegionalComparison();
    res.json({ 
      success: true,
      count: data.length, 
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get farming alerts by region
export const getFarmingAlerts = (req, res) => {
  try {
    const { region } = req.params;
    const data = weatherService.getFarmingAlerts(region);
    
    if (!data || data.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `No farming alerts found for region: ${region}` 
      });
    }
    
    res.json({ 
      success: true,
      region,
      count: data.length, 
      alerts: data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all farming alerts
export const getAllFarmingAlerts = (req, res) => {
  try {
    const data = weatherService.getAllFarmingAlerts();
    res.json({ 
      success: true,
      count: data.length, 
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get forecasts by condition
export const getForecastsByCondition = (req, res) => {
  try {
    const { condition } = req.params;
    const data = weatherService.getForecastsByCondition(condition);
    res.json({ 
      success: true,
      condition,
      count: data.length, 
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get regions by rainfall
export const getRegionsByRainfall = (req, res) => {
  try {
    const { minRainfall } = req.params;
    const data = weatherService.getRegionsByRainfall(Number(minRainfall));
    res.json({ 
      success: true,
      threshold: Number(minRainfall),
      count: data.length, 
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get regions by temperature
export const getRegionsByTemperature = (req, res) => {
  try {
    const { minTemp } = req.params;
    const data = weatherService.getRegionsByTemperature(Number(minTemp));
    res.json({ 
      success: true,
      threshold: Number(minTemp),
      count: data.length, 
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};