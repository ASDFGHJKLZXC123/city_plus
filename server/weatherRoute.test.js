const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

// Ensure the no-key fallback path is exercised (no live OpenWeather call).
delete process.env.OPENWEATHER_KEY;

const weatherRouter = require('./routes/weather');

function buildApp() {
  const app = express();
  app.use('/api/weather', weatherRouter);
  return app;
}

function httpGet(app, url) {
  return new Promise((resolve, reject) => {
    const http = require('node:http');
    const server = http.createServer(app);
    server.listen(0, () => {
      const { port } = server.address();
      http
        .get(`http://localhost:${port}${url}`, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            server.close();
            try { resolve(JSON.parse(data)); }
            catch (e) { reject(e); }
          });
          res.on('error', reject);
        })
        .on('error', reject);
    });
  });
}

test('weather route returns curated Austin data for Austin,TX,US', async () => {
  const body = await httpGet(buildApp(), '/api/weather?city=Austin,TX,US');
  assert.ok(Array.isArray(body) && body.length > 0);
  // Austin curated fixture, NOT San Francisco.
  assert.equal(body[0].name, 'Austin');
  assert.ok(body.every((p) => p.lat > 29 && p.lat < 32));
});

test('weather route synthesises Denver-centered data for Denver,CO,US', async () => {
  const body = await httpGet(
    buildApp(),
    '/api/weather?city=Denver,CO,US&lat=39.7392&lon=-104.9903',
  );
  assert.ok(Array.isArray(body) && body.length > 0);
  // Centered on Denver (~39.7), NOT San Francisco (~37.77).
  assert.ok(
    body.every((p) => p.lat > 39.6 && p.lat < 39.85),
    `expected Denver latitudes, got: ${body.map((p) => p.lat)}`,
  );
});

test('weather route falls back to San Francisco for an unknown city without coords', async () => {
  const body = await httpGet(buildApp(), '/api/weather?city=Atlantis,XX,US');
  assert.ok(Array.isArray(body) && body.length > 0);
  assert.ok(body.every((p) => p.lat > 37 && p.lat < 38));
});
