module.exports = function errorHandler(error, req, res, next) {
  const status = error.response?.status || 500;
  const message =
    error.response?.data?.message || error.message || 'Unexpected server failure while fetching city data.';

  if (process.env.NODE_ENV !== 'test') {
    process.stderr.write(`${message}\n`);
  }

  res.status(status).json({ message });
};
