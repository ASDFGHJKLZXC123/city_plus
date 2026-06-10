const test = require('node:test');
const assert = require('node:assert/strict');
const { transitFallback, TRANSIT_FIXTURES } = require('./data/transitFallback');

// --- Unit tests for transitFallback ---
// Guards the same comma-suffix regression for the transit layer.

test('returns curated Austin stops for bare city name', () => {
  const result = transitFallback('Austin');
  assert.ok(Array.isArray(result) && result.length > 0);
  assert.equal(result[0].name, 'Downtown Station');
  assert.notDeepEqual(result, TRANSIT_FIXTURES['San Francisco']);
});

test('strips comma-suffix and matches curated Austin', () => {
  assert.deepEqual(transitFallback('Austin,TX,US'), transitFallback('Austin'));
});

test('synthesises city-centered stops for a non-curated city (Denver)', () => {
  const result = transitFallback('Denver,CO,US', 39.7392, -104.9903);
  assert.ok(Array.isArray(result) && result.length > 0);
  assert.ok(
    result.every((p) => p.lat > 39.6 && p.lat < 39.85),
    `expected Denver latitudes (~39.7), got: ${result.map((p) => p.lat)}`,
  );
  assert.ok(result.every((p) => p.name.includes('Denver')));
});

test('unknown city without coordinates falls back to San Francisco', () => {
  assert.deepEqual(transitFallback('Atlantis,XX,US'), TRANSIT_FIXTURES['San Francisco']);
});

test('undefined input falls back to San Francisco', () => {
  assert.deepEqual(transitFallback(undefined), TRANSIT_FIXTURES['San Francisco']);
});
