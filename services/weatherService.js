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
