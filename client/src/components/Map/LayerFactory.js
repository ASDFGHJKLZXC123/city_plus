import { ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer, HexagonLayer } from '@deck.gl/aggregation-layers';
import { tempToColor } from '../../utils/colorScale';
import { toLngLat } from '../../utils/geoHelpers';

export function LayerFactory(activeLayers, data) {
  const layers = [];
  const airQuality = Array.isArray(data.airQuality) ? data.airQuality : [];
  const weather = Array.isArray(data.weather) ? data.weather : [];
  const transit = Array.isArray(data.transit) ? data.transit : [];

  if (activeLayers.airQuality && airQuality.length) {
    layers.push(
      new HeatmapLayer({
        id: 'air-quality-heat',
        data: airQuality,
        getPosition: toLngLat,
        getWeight: (point) => point.aqi,
        radiusPixels: 55,
        intensity: 1,
        threshold: 0.06,
      }),
    );
  }

  if (activeLayers.weather && weather.length) {
    layers.push(
      new ScatterplotLayer({
        id: 'weather-stations',
        data: weather,
        getPosition: toLngLat,
        getFillColor: (point) => tempToColor(point.temp),
        getRadius: 850,
        stroked: true,
        lineWidthMinPixels: 1,
        getLineColor: [255, 255, 255, 180],
        pickable: true,
      }),
    );
  }

  if (activeLayers.transit && transit.length) {
    layers.push(
      new HexagonLayer({
        id: 'transit-hex',
        data: transit,
        getPosition: toLngLat,
        radius: 220,
        elevationScale: 4,
        extruded: true,
        coverage: 0.8,
        pickable: true,
      }),
    );
  }

  return layers;
}
