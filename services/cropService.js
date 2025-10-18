import fs from "fs";
import path from "path";

const filePath = path.resolve("data/weather.json");

// --------- Loader ---------
const loadData = () => {
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
// --------- Crop Filters ---------
export const fetchCropsAll = () => loadData().crop_database || [];

// By crop name
export const filterCropsByName = (crop) =>
  fetchCropsAll().filter(c => c.crop_name.toLowerCase() === crop.toLowerCase());

// By region (checks optimal conditions)
export const filterCropsByRegion = (region) =>
  fetchCropsAll().filter(c =>
    //c.optimal_conditions.regions.some(r => r.toLowerCase() === region.toLowerCase())
    c.optimal_regions.some(r => r.toLowerCase() === region.toLowerCase())
  );

// By climate (temperature + rainfall suitability)
export const filterCropsByClimate = (temperature, rainfall) =>
  fetchCropsAll().filter(c => {
    const tempOk =
      temperature >= c.optimal_conditions.temp_range_c.min &&
      temperature <= c.optimal_conditions.temp_range_c.max;
    const rainOk =
      rainfall >= c.optimal_conditions.rainfall_mm.min &&
      rainfall <= c.optimal_conditions.rainfall_mm.max;
    return tempOk && rainOk;
  });

// By historical yield in a given year + region
//export const filterCropsByYield = ( region) =>
//  fetchCropsAll().filter()
// --------- Example Usage ---------
/*console.log("🌦 Weather 2023:", filterWeatherByYear(2023));
console.log("🌦 Gauteng Weather:", filterWeatherByRegion("Gauteng"));
console.log("🌦 June 2024:", filterWeatherByMonth(2024, "June"));
console.log("🌾 Crops in Free State:", filterCropsByRegion("Free State"));
console.log("🌾 Crops in 20°C + 600mm rainfall:", filterCropsByClimate(20, 600));
console.log("🌾 Crop yields in 2023 Free State:", filterCropsByYield(2023, "Free State"));
*/