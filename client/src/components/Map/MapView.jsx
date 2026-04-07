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

export default function MapView() {
  const location = useSelector((state) => state.filters.location);
  const activeLayers = useSelector((state) => state.layers.activeLayers);
  const data = useSelector((state) => state.data.byLayer);
  const [viewState, setViewState] = useState({
    ...DEFAULT_VIEW_STATE,
    ...centerForLocation(location),
  });
  const [tooltip, setTooltip] = useState(null);

  const layers = useMemo(() => LayerFactory(activeLayers, data), [activeLayers, data]);
  const mapPoints = useMemo(
    () => [...(data.weather || []), ...(data.airQuality || []), ...(data.transit || [])],
    [data],
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

  if (!token) {
    return <div className="map-fallback">Add `VITE_MAPBOX_TOKEN` to render the live basemap.</div>;
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
