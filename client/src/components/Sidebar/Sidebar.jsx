import { useSelector } from 'react-redux';
import LayerToggle from './LayerToggle';
import TimeFilter from './TimeFilter';
import AirQualityChart from '../Charts/AirQualityChart';
import WeatherWidget from '../Charts/WeatherWidget';
import Badge from '../common/Badge';
import { LAYER_DEFINITIONS } from '../../constants/layers';
import './sidebar.css';

export default function Sidebar() {
  const location = useSelector((state) => state.filters.location);
  const lastUpdated = useSelector((state) => state.data.lastUpdated);

  return (
    <aside className="sidebar">
      <div className="sidebar__hero">
        <p className="sidebar__eyebrow">Geo-operations console</p>
        <h1>CityPulse</h1>
        <p className="sidebar__summary">
          Monitor air quality, weather stations, and transit density layers across a single city view.
        </p>
        <div className="sidebar__badges">
          <Badge>{location.label}</Badge>
          <Badge tone="accent">{lastUpdated ? 'Feed synced' : 'Waiting for data'}</Badge>
        </div>
      </div>

      <section className="sidebar__section">
        <h2>Layers</h2>
        {LAYER_DEFINITIONS.map((layer) => (
          <LayerToggle key={layer.key} label={layer.label} color={layer.color} layerKey={layer.key} />
        ))}
      </section>

      <TimeFilter />
      <WeatherWidget />

      <section className="sidebar__section">
        <h2>Air Quality Trend</h2>
        <AirQualityChart />
      </section>
    </aside>
  );
}
