import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import DeckGL from '@deck.gl/react';
import Map from 'react-map-gl';
import { LayerFactory } from './LayerFactory';
import { DEFAULT_VIEW_STATE } from '../../constants/layers';
import { centerForLocation, centerForPoints } from '../../utils/geoHelpers';
import './map.css';
import 'mapbox-gl/dist/mapbox-gl.css';

function Tooltip({ item }) {
  if (!item) {
    return null;
  }

  return (
    <div className="map-tooltip" style={{ left: item.x, top: item.y }}>
      <strong>{item.object.name || 'Signal point'}</strong>
      <span>{item.object.aqi ? `AQI ${item.object.aqi}` : null}</span>
      <span>{item.object.temp ? `${item.object.temp}°C` : null}</span>
    </div>
  );
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasUsableMapboxToken(token) {
  return typeof token === 'string' && token.startsWith('pk.');
}

function FallbackMap({ data, location }) {
  const points = [
    ...data.airQuality.map((point) => ({
      ...point,
      type: 'Air quality',
      color: '#f97316',
      label: point.aqi == null ? point.name : `${point.name} · AQI ${Math.round(point.aqi)}`,
    })),
    ...data.weather.map((point) => ({
      ...point,
      type: 'Weather',
      color: '#38bdf8',
      label: point.temp == null ? point.name : `${point.name} · ${Math.round(point.temp)}°C`,
    })),
    ...data.transit.map((point) => ({
      ...point,
      type: 'Transit',
      color: '#10b981',
      label: point.name,
    })),
  ].filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon));

  const center = centerForPoints(points) || centerForLocation(location);

  return (
    <div className="map-fallback" role="img" aria-label="CityPulse demo map">
      <div className="map-fallback__grid" />
      <div className="map-fallback__copy">
        <span>Demo map</span>
        <strong>{location.label}</strong>
        <p>Mapbox is not configured locally, so CityPulse is showing fixture-backed city signals.</p>
      </div>
      {points.map((point, index) => {
        const left = Math.min(92, Math.max(8, 50 + (point.lon - center.longitude) * 1700));
        const top = Math.min(88, Math.max(14, 50 - (point.lat - center.latitude) * 1700));

        return (
          <span
            className="map-fallback__point"
            key={`${point.type}-${point.name}-${index}`}
            title={point.label}
            style={{ left: `${left}%`, top: `${top}%`, '--point-color': point.color }}
          >
            <span>{point.type[0]}</span>
          </span>
        );
      })}
    </div>
  );
}

export default function MapView() {
  const location = useSelector((state) => state.filters.location);
  const activeLayers = useSelector((state) => state.layers.activeLayers);
  const data = useSelector((state) => state.data.byLayer);
  const [viewState, setViewState] = useState({
    ...DEFAULT_VIEW_STATE,
    ...centerForLocation(location),
  });
  const [tooltip, setTooltip] = useState(null);

  const layerData = useMemo(() => ({
    airQuality: asArray(data.airQuality),
    weather: asArray(data.weather),
    transit: asArray(data.transit),
  }), [data]);
  const layers = useMemo(() => LayerFactory(activeLayers, layerData), [activeLayers, layerData]);
  const mapPoints = useMemo(
    () => [...layerData.weather, ...layerData.airQuality, ...layerData.transit],
    [layerData],
  );
  const token = process.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    const nextCenter = centerForPoints(mapPoints) || centerForLocation(location);

    setViewState((current) => ({
      ...current,
      ...nextCenter,
      zoom: nextCenter.zoom || current.zoom || DEFAULT_VIEW_STATE.zoom,
      pitch: DEFAULT_VIEW_STATE.pitch,
      bearing: DEFAULT_VIEW_STATE.bearing,
      transitionDuration: 900,
    }));
  }, [location, mapPoints]);

  if (!hasUsableMapboxToken(token)) {
    return <FallbackMap data={layerData} location={location} />;
  }

  return (
    <div className="map-root">
      <DeckGL
        viewState={viewState}
        controller
        layers={layers}
        onViewStateChange={({ viewState: nextViewState }) => setViewState(nextViewState)}
        onHover={({ object, x, y }) => setTooltip(object ? { object, x, y } : null)}
      >
        <Map mapboxAccessToken={token} mapStyle="mapbox://styles/mapbox/dark-v11" reuseMaps />
      </DeckGL>
      <Tooltip item={tooltip} />
    </div>
  );
}
