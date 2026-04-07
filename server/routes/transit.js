const express = require('express');
const cache = require('../middleware/cache');

const router = express.Router();

const TRANSIT_FIXTURES = {
  'San Francisco': [
    { lat: 37.7764, lon: -122.4172, name: 'Civic Center' },
    { lat: 37.784, lon: -122.4075, name: 'Powell Street' },
    { lat: 37.7929, lon: -122.3971, name: 'Embarcadero' },
  ],
  Austin: [
    { lat: 30.2677, lon: -97.7422, name: 'Downtown Station' },
    { lat: 30.2614, lon: -97.7386, name: 'Convention Center' },
    { lat: 30.2747, lon: -97.7404, name: 'Capitol' },
  ],
};

router.get('/', cache(300), async (req, res) => {
  const { city = 'San Francisco' } = req.query;
  res.json(TRANSIT_FIXTURES[city] || TRANSIT_FIXTURES['San Francisco']);
});

module.exports = router;
