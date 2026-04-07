const AIR_QUALITY_FIXTURES = {
  'San Francisco': [
    { lat: 37.7749, lon: -122.4194, aqi: 42, name: 'Downtown' },
    { lat: 37.7842, lon: -122.409, aqi: 51, name: 'Union Square' },
    { lat: 37.7648, lon: -122.463, aqi: 37, name: 'Sunset' },
  ],
  Austin: [
    { lat: 30.2672, lon: -97.7431, aqi: 48, name: 'Downtown' },
    { lat: 30.2821, lon: -97.7428, aqi: 55, name: 'UT District' },
    { lat: 30.251, lon: -97.7494, aqi: 44, name: 'South Lamar' },
  ],
  Seattle: [
    { lat: 47.6062, lon: -122.3321, aqi: 35, name: 'Downtown' },
    { lat: 47.6205, lon: -122.3493, aqi: 40, name: 'Queen Anne' },
    { lat: 47.5952, lon: -122.3316, aqi: 38, name: 'Pioneer Square' },
  ],
  Chicago: [
    { lat: 41.8781, lon: -87.6298, aqi: 58, name: 'Loop' },
    { lat: 41.8917, lon: -87.6078, aqi: 63, name: 'Streeterville' },
    { lat: 41.8843, lon: -87.6324, aqi: 52, name: 'West Loop' },
  ],
};

function getAirQualityFallback(city = 'San Francisco') {
  return AIR_QUALITY_FIXTURES[city] || AIR_QUALITY_FIXTURES['San Francisco'];
}

module.exports = { getAirQualityFallback };
