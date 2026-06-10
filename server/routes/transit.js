const express = require('express');
const cache = require('../middleware/cache');
const { transitFallback } = require('../data/transitFallback');

const router = express.Router();

router.get('/', cache(300), async (req, res) => {
  const { city = 'San Francisco,CA,US', lat, lon } = req.query;
  res.json(transitFallback(city, lat, lon));
});

module.exports = router;
