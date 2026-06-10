'use strict';

// Deterministic, coordinate-centered fixture generators.
//
// The client offers ~60 U.S. cities (see client/src/constants/cities.js) and
// sends the selected city's lat/lon to every endpoint. The curated fixture
// tables only cover a handful of cities, so for everything else we synthesise
// plausible data *centered on the selected coordinates*. The output is fully
// deterministic (same coordinates -> same data) so responses are stable across
// requests, friendly to the response cache, and predictable in tests.

// Deterministic pseudo-random value in [0, 1) seeded by coordinates + channel.
function unitNoise(lat, lon, channel) {
  const seed = Math.abs(lat) * 1000.0 + Math.abs(lon) * 17.0 + (channel + 1) * 91.7;
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

function round(value, dp) {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Deterministic AQI in a plausible "moderate" band (25..78) for a coordinate.
// Used both to colour synthetic fallback stations and to give real OpenAQ
// station locations a renderable value when the API response carries no
// measurement (see data/openaq.js).
function syntheticAqi(lat, lon, channel = 0) {
  return 25 + Math.round(unitNoise(lat, lon, 700 + channel) * 53);
}

// US EPA PM2.5 (24h, µg/m³) -> AQI breakpoints.
const PM25_BREAKPOINTS = [
  [0.0, 12.0, 0, 50],
  [12.1, 35.4, 51, 100],
  [35.5, 55.4, 101, 150],
  [55.5, 150.4, 151, 200],
  [150.5, 250.4, 201, 300],
  [250.5, 350.4, 301, 400],
  [350.5, 500.4, 401, 500],
];

function pm25ToAqi(concentration) {
  const c = Number(concentration);
  if (!Number.isFinite(c) || c < 0) return null;
  for (const [cLow, cHigh, iLow, iHigh] of PM25_BREAKPOINTS) {
    if (c <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (c - cLow) + iLow);
    }
  }
  return 500;
}

function generateAirQualityStations(lat, lon, cityName = 'Selected City') {
  const sectors = ['Central', 'North', 'East'];
  return sectors.map((sector, i) => ({
    lat: round(lat + (unitNoise(lat, lon, 10 + i) - 0.5) * 0.05, 5),
    lon: round(lon + (unitNoise(lat, lon, 20 + i) - 0.5) * 0.05, 5),
    aqi: syntheticAqi(lat, lon, i),
    name: `${cityName} ${sector}`,
  }));
}

function generateWeatherStations(lat, lon, cityName = 'Selected City') {
  const spots = ['Center', 'Metro'];
  return spots.map((spot, i) => {
    // Rough latitude-driven baseline so northern cities read colder.
    const baseTemp = 31 - (Math.abs(lat) - 24) * 0.7;
    const temp = clamp(Math.round(baseTemp + (unitNoise(lat, lon, 50 + i) - 0.5) * 6), -12, 42);
    const cloudCover = Math.round(unitNoise(lat, lon, 100 + i) * 100);
    const condition = cloudCover > 65 ? 'Clouds' : cloudCover > 30 ? 'Partly Cloudy' : 'Clear';
    return {
      lat: round(lat + (unitNoise(lat, lon, 30 + i) - 0.5) * 0.04, 5),
      lon: round(lon + (unitNoise(lat, lon, 40 + i) - 0.5) * 0.04, 5),
      temp,
      feelsLike: temp - 1,
      tempMin: temp - 2,
      tempMax: temp + 2,
      humidity: 45 + Math.round(unitNoise(lat, lon, 60 + i) * 38),
      pressure: 1006 + Math.round(unitNoise(lat, lon, 90 + i) * 18),
      windSpeed: round(2 + unitNoise(lat, lon, 70 + i) * 6, 1),
      windDeg: Math.round(unitNoise(lat, lon, 80 + i) * 359),
      cloudCover,
      visibility: 10 + Math.round(unitNoise(lat, lon, 110 + i) * 5),
      name: `${cityName} ${spot}`,
      condition,
      description: 'synthetic fixture conditions',
    };
  });
}

function generateTransitStops(lat, lon, cityName = 'Selected City') {
  const stops = ['Central Station', 'Transit Hub', 'Union Stop'];
  return stops.map((stop, i) => ({
    lat: round(lat + (unitNoise(lat, lon, 120 + i) - 0.5) * 0.05, 5),
    lon: round(lon + (unitNoise(lat, lon, 130 + i) - 0.5) * 0.05, 5),
    name: `${cityName} ${stop}`,
  }));
}

module.exports = {
  syntheticAqi,
  pm25ToAqi,
  generateAirQualityStations,
  generateWeatherStations,
  generateTransitStops,
};
