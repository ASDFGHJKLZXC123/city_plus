const NodeCache = require('node-cache');

const store = new NodeCache();

module.exports = function cache(ttlSeconds) {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = store.get(key);

    if (cached) {
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      store.set(key, body, ttlSeconds);
      return originalJson(body);
    };

    return next();
  };
};
