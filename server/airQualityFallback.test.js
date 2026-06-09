const test = require('node:test');
const assert = require('node:assert/strict');
const { getAirQualityFallback } = require('./data/airQualityFallback');

// --- Unit tests for getAirQualityFallback ---

test('returns correct data for bare city name', () => {
  const result = getAirQualityFallback('Austin');
  assert.ok(Array.isArray(result));
  assert.ok(result.length > 0);
  assert.ok(result.every((p) => p.lat && p.lon));
  // Must not be the SF default
  assert.notDeepEqual(result, getAirQualityFallback('San Francisco'));
});

test('strips comma-suffix and returns correct city (Austin,TX,US)', () => {
  const byComma = getAirQualityFallback('Austin,TX,US');
  const byBare = getAirQualityFallback('Austin');
  assert.deepEqual(byComma, byBare, 'comma-formatted query should match bare key');
});

test('strips comma-suffix for Seattle,WA,US', () => {
  assert.deepEqual(
    getAirQualityFallback('Seattle,WA,US'),
    getAirQualityFallback('Seattle'),
  );
});

test('strips comma-suffix for Chicago,IL,US', () => {
  assert.deepEqual(
    getAirQualityFallback('Chicago,IL,US'),
    getAirQualityFallback('Chicago'),
  );
});

test('strips comma-suffix for San Francisco,CA,US', () => {
  assert.deepEqual(
    getAirQualityFallback('San Francisco,CA,US'),
    getAirQualityFallback('San Francisco'),
  );
});

test('unknown city falls back to San Francisco, not undefined', () => {
  const result = getAirQualityFallback('Atlantis,XX,US');
  assert.deepEqual(result, getAirQualityFallback('San Francisco'));
});

test('undefined input falls back to San Francisco', () => {
  const result = getAirQualityFallback(undefined);
  assert.deepEqual(result, getAirQualityFallback('San Francisco'));
});
