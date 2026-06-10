'use strict';

const { syntheticAqi, pm25ToAqi } = require('./synthetic');

// Pull a measured PM2.5 value out of an OpenAQ v3 /locations result if one is
// present, and convert it to an AQI. The v3 /locations payload usually only
// describes the station and its sensors (not current readings), so this is
// best-effort: it checks the spots a measurement may appear and returns null
// when none is available. A null result means callers should treat the AQI as
// an estimate (see below).
function extractMeasuredAqi(location) {
  const sensors = Array.isArray(location?.sensors) ? location.sensors : [];
  for (const sensor of sensors) {
    const param = String(
      sensor?.parameter?.name ?? sensor?.parameter ?? sensor?.name ?? '',
    ).toLowerCase();
    const value = sensor?.latest?.value ?? sensor?.value;
    if (param.includes('pm25') || param.includes('pm2.5') || param.includes('pm2')) {
      const aqi = pm25ToAqi(value);
      if (aqi != null) return aqi;
    }
  }
  return null;
}

// Map an OpenAQ v3 /locations response to the {lat, lon, aqi, name} points the
// client expects. Stations without coordinates are dropped. When OpenAQ does
// not include a usable measurement, the point is flagged `estimated: true` and
// given a deterministic AQI derived from its coordinates so the heatmap still
// renders something meaningful.
function mapOpenAqLocations(results = []) {
  return (results || [])
    .map((location) => {
      const lat = location?.coordinates?.latitude;
      const lon = location?.coordinates?.longitude;
      const measured = extractMeasuredAqi(location);
      const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);
      return {
        lat,
        lon,
        aqi: measured != null ? measured : hasCoords ? syntheticAqi(lat, lon) : 0,
        name: location?.name,
        estimated: measured == null,
      };
    })
    .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon));
}

module.exports = { mapOpenAqLocations, extractMeasuredAqi };
