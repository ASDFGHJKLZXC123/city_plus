const express = require('express');
const axios = require('axios');
const cache = require('../middleware/cache');

const router = express.Router();

const WEATHER_FIXTURES = {
  'San Francisco': [
    {
      lat: 37.7749,
      lon: -122.4194,
      temp: 17,
      feelsLike: 16,
      tempMin: 14,
      tempMax: 19,
      humidity: 68,
      pressure: 1016,
      windSpeed: 5.1,
      windDeg: 260,
      cloudCover: 42,
      visibility: 11,
      name: 'San Francisco',
      condition: 'Clouds',
      description: 'fixture-backed marine layer',
    },
    {
      lat: 37.8044,
      lon: -122.2712,
      temp: 19,
      feelsLike: 18,
      tempMin: 16,
      tempMax: 21,
      humidity: 61,
      pressure: 1015,
      windSpeed: 3.8,
      windDeg: 245,
      cloudCover: 36,
      visibility: 12,
      name: 'Oakland',
      condition: 'Clear',
      description: 'fixture-backed clear intervals',
    },
  ],
  Austin: [
    {
      lat: 30.2672,
      lon: -97.7431,
      temp: 29,
      feelsLike: 31,
      tempMin: 26,
      tempMax: 33,
      humidity: 54,
      pressure: 1010,
      windSpeed: 4.4,
      windDeg: 170,
      cloudCover: 28,
      visibility: 14,
      name: 'Austin',
      condition: 'Clear',
      description: 'fixture-backed warm conditions',
    },
  ],
};

function weatherFallback(city) {
  return WEATHER_FIXTURES[city] || WEATHER_FIXTURES['San Francisco'];
}

router.get('/', cache(300), async (req, res, next) => {
  try {
    const { city = 'San Francisco' } = req.query;
    if (!process.env.OPENWEATHER_KEY) {
      res.json(weatherFallback(city));
      return;
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/find', {
      params: {
        q: city,
        appid: process.env.OPENWEATHER_KEY,
        units: 'metric',
        cnt: 15,
      },
    });

    const points = (response.data.list || []).map((station) => ({
      lat: station.coord.lat,
      lon: station.coord.lon,
      temp: Math.round(station.main.temp),
      feelsLike: Math.round(station.main.feels_like),
      tempMin: Math.round(station.main.temp_min),
      tempMax: Math.round(station.main.temp_max),
      humidity: station.main.humidity,
      pressure: station.main.pressure,
      windSpeed: station.wind?.speed ?? null,
      windDeg: station.wind?.deg ?? null,
      cloudCover: station.clouds?.all ?? null,
      visibility: typeof station.visibility === 'number' ? Math.round(station.visibility / 1000) : null,
      name: station.name,
      condition: station.weather?.[0]?.main || 'Unknown',
      description: station.weather?.[0]?.description || 'Unknown conditions',
    }));

    res.json(points);
  } catch (error) {
    if (error.response?.status === 401) {
      res.json(weatherFallback(req.query.city));
      return;
    }

    next(error);
  }
});

module.exports = router;
