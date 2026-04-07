import { useMapData } from './hooks/useMapData';
import { useWebSocket } from './hooks/useWebSocket';
import Sidebar from './components/Sidebar/Sidebar';
import MapView from './components/Map/MapView';
import LoadingSpinner from './components/common/LoadingSpinner';
import Badge from './components/common/Badge';
import './app.css';

export default function App() {
  useMapData();
  useWebSocket();

  return (
    <main className="app-shell">
      <Sidebar />
      <section className="map-panel">
        <div className="map-panel__header">
          <div>
            <p className="eyebrow">Urban signal monitoring</p>
            <h2>Live city systems at a glance</h2>
          </div>
          <div className="status-row">
            <Badge tone="accent">Realtime feed</Badge>
            <Badge>Deck.gl layers</Badge>
          </div>
        </div>
        <div className="map-frame">
          <MapView />
          <div className="map-frame__loading">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    </main>
  );
}
