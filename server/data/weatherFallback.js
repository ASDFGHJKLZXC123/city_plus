'use strict';

const { generateWeatherStations } = require('./synthetic');

// Hand-authored fixtures for the two cities we have curated data for. Every
// other city is synthesised from its coordinates so the weather layer is
// centered on the selected city instead of always showing San Francisco.
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

// city may arrive as a bare name ('Austin') or a comma-formatted query
// ('Austin,TX,US'); strip the suffix before matching curated fixtures.
function weatherFallback(city = 'San Francisco', lat, lon) {
  const name = String(city).split(',')[0].trim();
  if (WEATHER_FIXTURES[name]) {
    return WEATHER_FIXTURES[name];
  }

  const nLat = Number(lat);
  const nLon = Number(lon);
  if (Number.isFinite(nLat) && Number.isFinite(nLon)) {
    return generateWeatherStations(nLat, nLon, name || 'Selected City');
  }

  return WEATHER_FIXTURES['San Francisco'];
}

module.exports = { weatherFallback, WEATHER_FIXTURES };
