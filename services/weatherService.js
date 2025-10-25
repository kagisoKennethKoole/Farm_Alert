// services/weatherService.js
import { loadData } from "./dataLoader.js";
// --------- Weather Filters ---------
export const fetchWeatherAll = () => loadData().historical_weather_data || [];

export const filterWeatherByYear = (year) =>
  fetchWeatherAll().filter(item => item.year === Number(year));

export const filterWeatherByRegion = (region) =>
  fetchWeatherAll().filter(item => item.region.toLowerCase() === region.toLowerCase());
console.log('read region:',filterWeatherByRegion('Gauteng'));
export const filterWeatherByMonth = (year, month) =>
  fetchWeatherAll()
    .filter(item => item.year === Number(year))
    .flatMap(item =>
      item.monthly_data.filter(m => m.month.toLowerCase() === month.toLowerCase())
        .map(m => ({ year: item.year, region: item.region, ...m }))
    );
//console.log('read month:',filterWeatherByMonth(2020,'June'));
export const filterWeatherByDay = (year, month, day) =>
  fetchWeatherAll()
    .filter(item => item.year === Number(year))
    .flatMap(item =>
      item.monthly_data
        .filter(m => m.month.toLowerCase() === month.toLowerCase())
    );
//console.log('read day:',filterWeatherByDay(2020,'June',15));

export const filterWeatherByParams = ({ year, region, month }) =>
  fetchWeatherAll()
    .filter(item => {
      let match = true;
      if (year) match = match && item.year === Number(year);
      if (region) match = match && item.region.toLowerCase() === region.toLowerCase();
      return match;
    })
    .flatMap(item => {
      if (month) {
        return item.monthly_data
          .filter(m => m.month.toLowerCase() === month.toLowerCase())
          .map(m => ({ year: item.year, region: item.region, ...m }));
      }
      return item.monthly_data.map(m => ({ year: item.year, region: item.region, ...m }));
    });
//console.log('read params:',filterWeatherByParams({year:2024,region:'Gauteng',month:'June'}));
// Get all 7-day forecasts
export const getAllForecasts = () => {
  const data = loadData();
  return data?.seven_day_forecasts || [];
};

// Get forecast by region
export const getForecastByRegion = (region) => {
  const forecasts = getAllForecasts();
  return forecasts.find(f => 
    f.region.toLowerCase() === region.toLowerCase()
  );
};

// Get forecast by region and date
export const getForecastByDate = (region, date) => {
  const forecast = getForecastByRegion(region);
  if (!forecast) return null;
  
  return forecast.daily_forecasts.find(d => d.date === date);
};

// Get current week summaries for all regions
export const getWeekSummaries = () => {
  const forecasts = getAllForecasts();
  return forecasts.map(f => ({
    region: f.region,
    week_number: f.week_number,
    forecast_start_date: f.forecast_start_date,
    weekly_summary: f.weekly_summary,
    farming_alerts: f.farming_alerts
  }));
};

// Get regional comparison
export const getRegionalComparison = () => {
  const forecasts = getAllForecasts();
  
  return forecasts.map(f => ({
    region: f.region,
    total_rainfall: f.weekly_summary.total_rainfall_mm,
    avg_max_temp: f.weekly_summary.avg_max_temp_c,
    avg_min_temp: f.weekly_summary.avg_min_temp_c,
    conditions: f.weekly_summary.predominant_conditions,
    heat_stress_days: f.weekly_summary.heat_stress_days,
    frost_risk: f.weekly_summary.frost_risk
  }));
};

// Get farming alerts by region
export const getFarmingAlerts = (region) => {
  const forecast = getForecastByRegion(region);
  return forecast?.farming_alerts || [];
};

// Get all farming alerts
export const getAllFarmingAlerts = () => {
  const forecasts = getAllForecasts();
  return forecasts.map(f => ({
    region: f.region,
    alerts: f.farming_alerts
  }));
};

// Filter forecasts by conditions
export const getForecastsByCondition = (condition) => {
  const forecasts = getAllForecasts();
  return forecasts.filter(f => 
    f.weekly_summary.predominant_conditions.toLowerCase().includes(condition.toLowerCase())
  );
};

// Get regions with rainfall above threshold
export const getRegionsByRainfall = (minRainfall) => {
  const forecasts = getAllForecasts();
  return forecasts.filter(f => 
    f.weekly_summary.total_rainfall_mm >= minRainfall
  ).map(f => ({
    region: f.region,
    total_rainfall: f.weekly_summary.total_rainfall_mm,
    conditions: f.weekly_summary.predominant_conditions
  }));
};

// Get regions with temperature above threshold
export const getRegionsByTemperature = (minTemp) => {
  const forecasts = getAllForecasts();
  return forecasts.filter(f => 
    f.weekly_summary.avg_max_temp_c >= minTemp
  ).map(f => ({
    region: f.region,
    avg_max_temp: f.weekly_summary.avg_max_temp_c,
    heat_stress_days: f.weekly_summary.heat_stress_days
  }));
};