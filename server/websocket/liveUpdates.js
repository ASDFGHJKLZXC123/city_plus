const WebSocket = require('ws');
const axios = require('axios');
const { getAirQualityFallback } = require('../data/airQualityFallback');
const { mapOpenAqLocations } = require('../data/openaq');

function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (socket) => {
    let currentCity = 'San Francisco,CA,US';
    // Default to San Francisco until the client sends a SET_CITY message.
    let currentLat = 37.7749;
    let currentLon = -122.4194;
    let timer = null;

    const sendLiveUpdate = async () => {
      try {
        const response = await axios.get('https://api.openaq.org/v3/locations', {
          params: {
            coordinates: `${currentLat},${currentLon}`,
            radius: 50000,
            limit: 10,
          },
          headers: process.env.OPENAQ_KEY ? { 'X-API-Key': process.env.OPENAQ_KEY } : {},
        });

        socket.send(
          JSON.stringify({
            type: 'AIR_QUALITY_UPDATE',
            payload: mapOpenAqLocations(response.data.results),
          }),
        );
      } catch (error) {
        // Any API failure → push city-centered fixture data so the client keeps working.
        if (error.response || error.code === 'ECONNREFUSED') {
          socket.send(
            JSON.stringify({
              type: 'AIR_QUALITY_UPDATE',
              payload: getAirQualityFallback(currentCity, currentLat, currentLon),
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
          if (typeof message.lat === 'number') currentLat = message.lat;
          if (typeof message.lon === 'number') currentLon = message.lon;
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
