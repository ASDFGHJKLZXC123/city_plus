const test = require('node:test');
const assert = require('node:assert/strict');

// --- Route integration tests: 410 fallback path with non-default cities ---
//
// We inject a mock axios into the module cache before requiring the route so we
// can simulate OpenAQ returning 410 and verify the route responds with the
// correct city's fixture data (not the San Francisco default).

function makeGoneError() {
  const err = new Error('Gone');
  err.response = { status: 410 };
  return err;
}

function buildApp(cityToReturn) {
  // Inject mock axios
  const axiosMod = require.resolve('axios');
  const realAxios = require.cache[axiosMod];
  require.cache[axiosMod] = {
    id: axiosMod,
    filename: axiosMod,
    loaded: true,
    exports: { get: async () => { throw makeGoneError(); } },
  };

  // Force route to re-load with the mocked axios
  const routeMod = require.resolve('./routes/airQuality');
  delete require.cache[routeMod];
  const router = require('./routes/airQuality');

  // Restore real axios so other requires aren't affected
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

test('410 fallback returns Austin data for Austin,TX,US (not San Francisco)', async () => {
  const app = buildApp();
  const body = await httpGet(app, '/api/air-quality?city=Austin,TX,US');

  assert.ok(Array.isArray(body), 'response should be an array');
  assert.ok(body.length > 0, 'should have fixture data');
  // Austin fixtures lat ~30.x; SF fixtures lat ~37.x
  assert.ok(
    body.every((p) => p.lat > 29 && p.lat < 32),
    `expected Austin latitudes (~30), got: ${body.map((p) => p.lat)}`,
  );
});

test('410 fallback returns Seattle data for Seattle,WA,US', async () => {
  const app = buildApp();
  const body = await httpGet(app, '/api/air-quality?city=Seattle,WA,US');

  assert.ok(Array.isArray(body));
  // Seattle fixtures lat ~47.x
  assert.ok(
    body.every((p) => p.lat > 47 && p.lat < 48),
    `expected Seattle latitudes (~47), got: ${body.map((p) => p.lat)}`,
  );
});

test('410 fallback returns Chicago data for Chicago,IL,US', async () => {
  const app = buildApp();
  const body = await httpGet(app, '/api/air-quality?city=Chicago,IL,US');

  assert.ok(Array.isArray(body));
  // Chicago fixtures lat ~41.x
  assert.ok(
    body.every((p) => p.lat > 41 && p.lat < 42),
    `expected Chicago latitudes (~41), got: ${body.map((p) => p.lat)}`,
  );
});

test('410 fallback for unknown city returns San Francisco as default', async () => {
  const app = buildApp();
  const body = await httpGet(app, '/api/air-quality?city=Atlantis,XX,US');

  assert.ok(Array.isArray(body));
  // SF fixtures lat ~37.x
  assert.ok(
    body.every((p) => p.lat > 37 && p.lat < 38),
    `expected SF latitudes (~37), got: ${body.map((p) => p.lat)}`,
  );
});
