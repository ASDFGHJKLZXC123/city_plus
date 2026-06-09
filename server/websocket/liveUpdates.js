const WebSocket = require('ws');
const axios = require('axios');
const { getAirQualityFallback } = require('../data/airQualityFallback');

function mapOpenAqResults(results = []) {
  return results
    .map((location) => ({
      lat: location.coordinates?.latitude,
      lon: location.coordinates?.longitude,
      aqi: location.parameters?.[0]?.lastValue ?? 0,
      name: location.name,
    }))
    .filter((point) => point.lat && point.lon);
}

function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (socket) => {
    let currentCity = 'San Francisco,CA,US';
    let timer = null;

    const sendLiveUpdate = async () => {
      try {
        const response = await axios.get('https://api.openaq.org/v2/locations', {
          params: { city: currentCity, limit: 10, has_geo: true },
          headers: process.env.OPENAQ_KEY ? { 'X-API-Key': process.env.OPENAQ_KEY } : {},
        });

        socket.send(
          JSON.stringify({
            type: 'AIR_QUALITY_UPDATE',
            payload: mapOpenAqResults(response.data.results),
          }),
        );
      } catch (error) {
        if (error.response?.status === 410) {
          socket.send(
            JSON.stringify({
              type: 'AIR_QUALITY_UPDATE',
              payload: getAirQualityFallback(currentCity),
            }),
          );
          return;
        }

        if (process.env.NODE_ENV !== 'test') {
          process.stderr.write(`WS push failed: ${error.message}\n`);
        }
      }
    };

    const restartTimer = () => {
      clearInterval(timer);
      sendLiveUpdate();
      timer = setInterval(sendLiveUpdate, 60000);
    };

    socket.on('message', (raw) => {
      try {
        const message = JSON.parse(raw);
        if (message.type === 'SET_CITY' && typeof message.city === 'string') {
          currentCity = message.city;
          restartTimer();
        }
      } catch {
        // ignore malformed messages
      }
    });

    restartTimer();
    socket.on('close', () => clearInterval(timer));
  });
}

module.exports = { startWebSocketServer };
