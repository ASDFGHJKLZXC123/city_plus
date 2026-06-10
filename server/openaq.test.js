const test = require('node:test');
const assert = require('node:assert/strict');
const { mapOpenAqLocations } = require('./data/openaq');
const { pm25ToAqi } = require('./data/synthetic');

// --- Unit tests for the shared OpenAQ v3 mapper ---

test('pm25ToAqi converts known EPA breakpoints', () => {
  assert.equal(pm25ToAqi(0), 0);
  assert.equal(pm25ToAqi(12.0), 50);
  assert.equal(pm25ToAqi(35.4), 100);
  assert.equal(pm25ToAqi(-1), null);
  assert.equal(pm25ToAqi('not-a-number'), null);
});

test('uses a real measured PM2.5 value when present (not estimated)', () => {
  const results = [
    {
      coordinates: { latitude: 39.74, longitude: -104.99 },
      name: 'Denver Station',
      sensors: [{ parameter: { name: 'pm25' }, latest: { value: 35.4 } }],
    },
  ];
  const points = mapOpenAqLocations(results);
  assert.equal(points.length, 1);
  assert.equal(points[0].aqi, 100);
  assert.equal(points[0].estimated, false);
});

test('estimates a deterministic AQI when no measurement is available', () => {
  const results = [
    { coordinates: { latitude: 39.74, longitude: -104.99 }, name: 'No-data Station', sensors: [] },
  ];
  const points = mapOpenAqLocations(results);
  assert.equal(points.length, 1);
  assert.equal(points[0].estimated, true);
  assert.ok(typeof points[0].aqi === 'number' && points[0].aqi >= 0 && points[0].aqi <= 500);
});

test('drops stations without coordinates', () => {
  const results = [
    { coordinates: null, name: 'Bad', sensors: [] },
    { coordinates: { latitude: 41.88, longitude: -87.63 }, name: 'Good', sensors: [] },
  ];
  const points = mapOpenAqLocations(results);
  assert.equal(points.length, 1);
  assert.equal(points[0].name, 'Good');
});

test('handles empty / missing input safely', () => {
  assert.deepEqual(mapOpenAqLocations(), []);
  assert.deepEqual(mapOpenAqLocations(null), []);
  assert.deepEqual(mapOpenAqLocations([]), []);
});
