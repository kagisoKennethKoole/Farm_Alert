import {
  fetchWeatherAll ,
  filterWeatherByYear,
  filterWeatherByMonth,
  filterWeatherByDay,
  filterWeatherByParams
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

export const getByDay = (req, res) => {
  const { year, month, day } = req.params;
  const data = filterWeatherByDay(year, month, day);
  res.json(data);
};

export const searchWeather = (req, res) => {
  const { city, month, year } = req.params;
  const data = filterWeatherByParams({ city, month, year });
  res.json(data);
};
