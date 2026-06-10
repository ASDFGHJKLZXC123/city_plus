const test = require('node:test');
const assert = require('node:assert/strict');
const { weatherFallback, WEATHER_FIXTURES } = require('./data/weatherFallback');

// --- Unit tests for weatherFallback ---
// These guard the regression where every comma-formatted city query
// ('Austin,TX,US' etc.) silently resolved to San Francisco.

test('returns curated Austin data for bare city name', () => {
  const result = weatherFallback('Austin');
  assert.ok(Array.isArray(result) && result.length > 0);
  assert.equal(result[0].name, 'Austin');
  assert.notDeepEqual(result, WEATHER_FIXTURES['San Francisco']);
});

test('strips comma-suffix and matches curated Austin', () => {
  assert.deepEqual(weatherFallback('Austin,TX,US'), weatherFallback('Austin'));
});

test('synthesises city-centered data for a non-curated city (Denver)', () => {
  const result = weatherFallback('Denver,CO,US', 39.7392, -104.9903);
  assert.ok(Array.isArray(result) && result.length > 0);
  // Centered on Denver (~39.7), NOT San Francisco (~37.77).
  assert.ok(
    result.every((p) => p.lat > 39.6 && p.lat < 39.85),
    `expected Denver latitudes (~39.7), got: ${result.map((p) => p.lat)}`,
  );
  assert.ok(result.every((p) => typeof p.temp === 'number' && typeof p.humidity === 'number'));
  assert.ok(result.every((p) => p.name.includes('Denver')));
});

test('non-curated city is deterministic (same coords -> same data)', () => {
  const a = weatherFallback('Denver,CO,US', 39.7392, -104.9903);
  const b = weatherFallback('Denver,CO,US', 39.7392, -104.9903);
  assert.deepEqual(a, b);
});

test('unknown city without coordinates falls back to San Francisco', () => {
  assert.deepEqual(weatherFallback('Atlantis,XX,US'), WEATHER_FIXTURES['San Francisco']);
});

test('undefined input falls back to San Francisco', () => {
  assert.deepEqual(weatherFallback(undefined), WEATHER_FIXTURES['San Francisco']);
});
