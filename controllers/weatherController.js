import {
  fetchWeatherAll ,
  filterWeatherByYear,
  filterWeatherByMonth,
  filterWeatherByDay,
  filterWeatherByParams,
  filterWeatherByRegion
} from "../services/weatherService.js";

export const getAllWeather = (req, res) => {
  const data = fetchWeatherAll();
  res.json(data);
};

export const getByYear = (req, res) => {
  const { year } = req.params;
  const data = filterWeatherByYear(year);
  res.json(data);
};

export const getByMonth = (req, res) => {
  const { year, month } = req.params;
  const data = filterWeatherByMonth(year, month);
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
  const data = filterWeatherByParams({ year, region, month });
  res.json(data);
  console.log('search params:',{ year, region, month });
};

export const getByRegion = (req, res) => {
  const { region } = req.params;
  console.log('region param:',region);
  const data = filterWeatherByRegion(region);
  res.json(data);
};