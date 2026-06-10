const express = require('express');
const axios = require('axios');
const cache = require('../middleware/cache');
const { weatherFallback } = require('../data/weatherFallback');

const router = express.Router();

router.get('/', cache(300), async (req, res, next) => {
  const { city = 'San Francisco,CA,US', lat, lon } = req.query;
  try {
    if (!process.env.OPENWEATHER_KEY) {
      res.json(weatherFallback(city, lat, lon));
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

    res.json(points.length ? points : weatherFallback(city, lat, lon));
  } catch (error) {
    // Any upstream failure (bad key, rate limit, outage) falls back to
    // city-centered fixtures so the weather layer keeps working.
    if (error.response || error.code === 'ECONNREFUSED') {
      res.json(weatherFallback(city, lat, lon));
      return;
    }

    next(error);
  }
});

module.exports = router;
