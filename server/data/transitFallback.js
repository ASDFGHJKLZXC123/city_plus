'use strict';

const { generateTransitStops } = require('./synthetic');

// Curated transit stops for two cities; all other cities are synthesised from
// their coordinates. Transit has no live upstream source in this project, so
// these fixtures are the only data path.
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

// city may arrive bare ('Austin') or comma-formatted ('Austin,TX,US'); strip
// the suffix before matching curated fixtures.
function transitFallback(city = 'San Francisco', lat, lon) {
  const name = String(city).split(',')[0].trim();
  if (TRANSIT_FIXTURES[name]) {
    return TRANSIT_FIXTURES[name];
  }

  const nLat = Number(lat);
  const nLon = Number(lon);
  if (Number.isFinite(nLat) && Number.isFinite(nLon)) {
    return generateTransitStops(nLat, nLon, name || 'Selected City');
  }

  return TRANSIT_FIXTURES['San Francisco'];
}

module.exports = { transitFallback, TRANSIT_FIXTURES };
