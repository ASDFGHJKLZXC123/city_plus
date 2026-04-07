const test = require('node:test');
const assert = require('node:assert/strict');
const cache = require('./middleware/cache');

test('cache middleware stores response by url', () => {
  const middleware = cache(10);
  let nextCalled = false;
  const req = { originalUrl: '/api/weather?city=SF' };
  const res = {
    json(payload) {
      this.payload = payload;
      return payload;
    },
  };

  middleware(req, res, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);

  res.json({ ok: true });

  let cachedBody = null;
  middleware(
    req,
    {
      json(payload) {
        cachedBody = payload;
      },
    },
    () => {},
  );

  assert.deepEqual(cachedBody, { ok: true });
});
