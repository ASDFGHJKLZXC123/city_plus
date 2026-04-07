export function toLngLat(point) {
  return [point.lon, point.lat];
}

export function centerForPoints(points = []) {
  const validPoints = points.filter(
    (point) => Number.isFinite(point?.lat) && Number.isFinite(point?.lon),
  );

  if (!validPoints.length) {
    return null;
  }

  const totals = validPoints.reduce(
    (accumulator, point) => ({
      lat: accumulator.lat + point.lat,
      lon: accumulator.lon + point.lon,
    }),
    { lat: 0, lon: 0 },
  );

  return {
    latitude: totals.lat / validPoints.length,
    longitude: totals.lon / validPoints.length,
  };
}

export function centerForCity(city) {
  const presets = {
    'San Francisco': { longitude: -122.4194, latitude: 37.7749, zoom: 11 },
    Austin: { longitude: -97.7431, latitude: 30.2672, zoom: 10.5 },
    Seattle: { longitude: -122.3321, latitude: 47.6062, zoom: 10.8 },
    Chicago: { longitude: -87.6298, latitude: 41.8781, zoom: 10.8 },
  };

  return presets[city] ?? presets['San Francisco'];
}

export function centerForLocation(location) {
  if (location?.longitude && location?.latitude) {
    return {
      longitude: location.longitude,
      latitude: location.latitude,
      zoom: location.zoom,
    };
  }

  return centerForCity(location?.query || location?.label);
}
