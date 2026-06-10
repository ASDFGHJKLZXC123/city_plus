const test = require('node:test');
const assert = require('node:assert/strict');

// --- Route integration tests ---
//
// Two scenarios are tested:
//
//  1. No-coordinates fallback: the client did not send lat/lon (or they're
//     missing).  The route returns fixture data without calling OpenAQ at all.
//
//  2. v3 success path: the client sends lat/lon and OpenAQ v3 returns station
//     data.  We mock axios to return a sample v3 response and verify the route
//     maps it correctly.

function buildApp({ mockGet } = {}) {
  const axiosMod = require.resolve('axios');
  const realAxios = require.cache[axiosMod];

  if (mockGet) {
    require.cache[axiosMod] = {
      id: axiosMod,
      filename: axiosMod,
      loaded: true,
      exports: { get: mockGet },
    };
  }

  // Force route to re-load so it picks up the (possibly mocked) axios.
  const routeMod = require.resolve('./routes/airQuality');
  delete require.cache[routeMod];
  const router = require('./routes/airQuality');

  // Restore real axios immediately so other requires aren't affected.
  require.cache[axiosMod] = realAxios;

  const express = require('express');
  const app = express();
  app.use('/api/air-quality', router);
  return app;
}

function httpGet(app, url) {
  return new Promise((resolve, reject) => {
    const http = require('node:http');
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      http.get(`http://localhost:${port}${url}`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          server.close();
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(e); }
        });
        res.on('error', reject);
      }).on('error', reject);
    });
  });
}

// ── No-coordinates fallback tests ──────────────────────────────────────────

test('no-coordinates fallback returns Austin data for Austin,TX,US', async () => {
  const app = buildApp(); // no mock needed; axios never called
  const body = await httpGet(app, '/api/air-quality?city=Austin,TX,US');

  assert.ok(Array.isArray(body), 'response should be an array');
  assert.ok(body.length > 0, 'should have fixture data');
  // Austin fixtures lat ~30.x
  assert.ok(
    body.every((p) => p.lat > 29 && p.lat < 32),
    `expected Austin latitudes (~30), got: ${body.map((p) => p.lat)}`,
  );
});

test('no-coordinates fallback returns Seattle data for Seattle,WA,US', async () => {
  const app = buildApp();
  const body = await httpGet(app, '/api/air-quality?city=Seattle,WA,US');

  assert.ok(Array.isArray(body));
  // Seattle fixtures lat ~47.x
  assert.ok(
    body.every((p) => p.lat > 47 && p.lat < 48),
    `expected Seattle latitudes (~47), got: ${body.map((p) => p.lat)}`,
  );
});

test('no-coordinates fallback returns Chicago data for Chicago,IL,US', async () => {
  const app = buildApp();
  const body = await httpGet(app, '/api/air-quality?city=Chicago,IL,US');

  assert.ok(Array.isArray(body));
  // Chicago fixtures lat ~41.x
  assert.ok(
    body.every((p) => p.lat > 41 && p.lat < 42),
    `expected Chicago latitudes (~41), got: ${body.map((p) => p.lat)}`,
  );
});

test('no-coordinates fallback for unknown city returns San Francisco as default', async () => {
  const app = buildApp();
  const body = await httpGet(app, '/api/air-quality?city=Atlantis,XX,US');

  assert.ok(Array.isArray(body));
  // SF fixtures lat ~37.x
  assert.ok(
    body.every((p) => p.lat > 37 && p.lat < 38),
    `expected SF latitudes (~37), got: ${body.map((p) => p.lat)}`,
  );
});

// ── v3 API success-path test ───────────────────────────────────────────────

test('v3 success path maps location coordinates from OpenAQ response', async () => {
  const fakeV3Results = [
    { coordinates: { latitude: 30.27, longitude: -97.74 }, name: 'Austin Station 1', sensors: [] },
    { coordinates: { latitude: 30.31, longitude: -97.72 }, name: 'Austin Station 2', sensors: [] },
    // Entry without coordinates — should be filtered out.
    { coordinates: null, name: 'Bad entry', sensors: [] },
  ];

  const app = buildApp({
    mockGet: async () => ({ data: { results: fakeV3Results } }),
  });

  const body = await httpGet(app, '/api/air-quality?city=Austin,TX,US&lat=30.2672&lon=-97.7431');

  assert.ok(Array.isArray(body));
  // The entry with null coordinates must be dropped.
  assert.strictEqual(body.length, 2);
  assert.ok(body.every((p) => typeof p.lat === 'number' && typeof p.lon === 'number'));
  assert.ok(body.every((p) => typeof p.aqi === 'number' && p.aqi >= 0 && p.aqi <= 500));
  assert.ok(body.every((p) => typeof p.name === 'string'));
  // The mocked v3 response carries no measurement, so AQI is flagged estimated.
  assert.ok(body.every((p) => p.estimated === true));
});
