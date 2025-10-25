// services/cropService.js
//import fs from "fs";
//import path from "path";
import { loadData } from "./dataLoader.js";

//const filePath = path.resolve("data/weather.json");

// --------- Loader ---------
/*const loadData = () => {
  try {
    if (!fs.existsSync(filePath)) {
      console.error("❌ Weather data file not found:", filePath);
      return {};
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw)[0]; // ✅ The JSON root object

    if (!data.historical_weather_data || !data.crop_database) {
      console.error("❌ Invalid JSON structure");
      return {};
    }

    return data;
  } catch (err) {
    console.error("❌ Failed to load data:", err.message);
    return {};
  }
};
*/
// --------- Crop Filters ---------
// Get all crops (from historical data if available)
export const getAllCrops = () => {
  const data = loadData();
  // Note: Your current JSON doesn't have crop_database
  // This is a placeholder structure
  return data?.crop_database || [];
};

// Get crop by name
export const getCropByName = (cropName) => {
  const crops = getAllCrops();
  return crops.find(c =>
    c.crop_name?.toLowerCase() === cropName.toLowerCase()
  );
};

// Get crops by region (based on optimal growing conditions)
export const getCropsByRegion = (region) => {
  const crops = getAllCrops();
  return crops.filter(c =>
    c.optimal_regions?.some(r => r.toLowerCase() === region.toLowerCase())
  );
};

// Get crops suitable for current weather conditions
export const getCropsByClimate = (temperature, rainfall) => {
  const crops = getAllCrops();
  return crops.filter(c => {
    if (!c.optimal_conditions) return false;

    const tempOk = temperature >= c.optimal_conditions.temp_range_c?.min &&
      temperature <= c.optimal_conditions.temp_range_c?.max;
    const rainOk = rainfall >= c.optimal_conditions.rainfall_mm?.min &&
      rainfall <= c.optimal_conditions.rainfall_mm?.max;

    return tempOk && rainOk;
  });
};
export const getForecastByRegion = (region) => {
  const data = loadData();
  const forecasts = data?.seven_day_forecasts || [];
  console.log("Available forecasts:", forecasts.map(f => f.region.toLowerCase() ? f.region = region : "No match"));

  return forecasts.find(f =>
    f.region?.toLowerCase() === region.toLowerCase()
  );
}

// Get crop recommendations based on region's weather forecast
export const getCropRecommendationsByRegion = (region) => {
  const forecast = getForecastByRegion(region);
  console.log("Requested Region forecast:", forecast);
  
  if (!forecast) return null;

  // Access the weekly_summary from the forecast object
  const summary = forecast.weekly_summary;
  console.log("Forecast Summary:", summary);
  
  if (!summary) {
    console.error("No weekly_summary found in forecast");
    return null;
  }

  const recommendations = {
    region,
    weather_summary: summary,
    suitable_crops: [],
    warnings: [],
    optimal_activities: []
  };

  // High rainfall recommendations
  if (summary.total_rainfall_mm > 40) {
    recommendations.suitable_crops.push({
      category: "Water-intensive crops",
      crops: ["Rice", "Sugarcane", "Vegetables", "Pastures"],
      reason: `High rainfall expected (${summary.total_rainfall_mm}mm)`
    });
    recommendations.warnings.push("Monitor for waterlogging in low-lying areas");
  }

  // Moderate rainfall
  if (summary.total_rainfall_mm >= 20 && summary.total_rainfall_mm <= 40) {
    recommendations.suitable_crops.push({
      category: "General field crops",
      crops: ["Maize", "Soybeans", "Sunflower", "Wheat"],
      reason: "Good soil moisture conditions"
    });
    recommendations.optimal_activities.push("Ideal planting window for summer crops");
  }

  // Low rainfall
  if (summary.total_rainfall_mm < 20) {
    recommendations.suitable_crops.push({
      category: "Drought-tolerant crops",
      crops: ["Sorghum", "Millet", "Chickpeas"],
      reason: "Low rainfall forecasted"
    });
    recommendations.warnings.push("Consider irrigation for water-sensitive crops");
  }

  // High temperature recommendations
  if (summary.avg_max_temp_c > 30) {
    recommendations.suitable_crops.push({
      category: "Heat-loving crops",
      crops: ["Tomatoes", "Peppers", "Melons", "Cotton"],
      reason: `High temperatures (avg ${summary.avg_max_temp_c}°C)`
    });
    if (summary.heat_stress_days > 0) {
      recommendations.warnings.push(`Heat stress expected for ${summary.heat_stress_days} days`);
    }
  }

  // Moderate temperature
  if (summary.avg_max_temp_c >= 20 && summary.avg_max_temp_c <= 30) {
    recommendations.suitable_crops.push({
      category: "Temperate crops",
      crops: ["Wheat", "Barley", "Potatoes", "Carrots"],
      reason: "Optimal temperature range"
    });
  }

  // Frost risk
  if (summary.frost_risk && summary.frost_risk !== "None") {
    recommendations.warnings.push(`Frost risk: ${summary.frost_risk}`);
    recommendations.warnings.push("Protect sensitive crops and seedlings");
  }

  // Add farming alerts from forecast
  if (forecast.farming_alerts) {
    recommendations.farming_alerts = forecast.farming_alerts;
  }

  return recommendations;
};