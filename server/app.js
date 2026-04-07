const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const weatherRoute = require('./routes/weather');
const airQualityRoute = require('./routes/airQuality');
const transitRoute = require('./routes/transit');
const errorHandler = require('./middleware/errorHandler');
const { startWebSocketServer } = require('./websocket/liveUpdates');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/weather', weatherRoute);
app.use('/api/air-quality', airQualityRoute);
app.use('/api/transit', transitRoute);
app.use(errorHandler);

const port = process.env.PORT || 4000;

if (require.main === module) {
  const server = http.createServer(app);
  startWebSocketServer(server);
  server.listen(port, () => {
    process.stdout.write(`CityPulse server listening on ${port}\n`);
  });
}

module.exports = app;
