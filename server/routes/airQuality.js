const express = require('express');
const axios = require('axios');
const cache = require('../middleware/cache');
const { getAirQualityFallback } = require('../data/airQualityFallback');
const { mapOpenAqLocations } = require('../data/openaq');

const router = express.Router();

router.get('/', cache(300), async (req, res, next) => {
  const { city = 'San Francisco,CA,US', lat, lon } = req.query;

  // Without coordinates we cannot query the v3 API (it has no city-name filter).
  // Fall back to fixture data immediately so the map still renders.
  if (!lat || !lon) {
    return res.json(getAirQualityFallback(city, lat, lon));
  }

  try {
    const response = await axios.get('https://api.openaq.org/v3/locations', {
      params: {
        coordinates: `${lat},${lon}`,
        radius: 50000,
        limit: 50,
      },
      headers: process.env.OPENAQ_KEY ? { 'X-API-Key': process.env.OPENAQ_KEY } : {},
    });

    res.json(mapOpenAqLocations(response.data.results));
  } catch (error) {
    // Treat any non-2xx (including 404 / 429 / 5xx) as a signal to fall back.
    if (error.response || error.code === 'ECONNREFUSED') {
      return res.json(getAirQualityFallback(city, lat, lon));
    }

    next(error);
  }
});

module.exports = router;
