const express = require('express');
const axios = require('axios');
const cache = require('../middleware/cache');
const { getAirQualityFallback } = require('../data/airQualityFallback');

const router = express.Router();

router.get('/', cache(300), async (req, res, next) => {
  try {
    const { city = 'San Francisco' } = req.query;
    const response = await axios.get('https://api.openaq.org/v2/locations', {
      params: { city, limit: 50, has_geo: true },
      headers: process.env.OPENAQ_KEY ? { 'X-API-Key': process.env.OPENAQ_KEY } : {},
    });

    const points = (response.data.results || []).map((location) => ({
      lat: location.coordinates?.latitude,
      lon: location.coordinates?.longitude,
      aqi: location.parameters?.[0]?.lastValue ?? 0,
      name: location.name,
    }));

    res.json(points.filter((point) => point.lat && point.lon));
  } catch (error) {
    if (error.response?.status === 410) {
      res.json(getAirQualityFallback(req.query.city));
      return;
    }

    next(error);
  }
});

module.exports = router;
