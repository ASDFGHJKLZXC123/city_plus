import { useSelector } from 'react-redux';
import { aqiToTone } from '../../utils/colorScale';

const EMPTY_POINTS = [];

function formatWind(station) {
  if (station?.windSpeed == null) {
    return 'N/A';
  }

  const direction = station.windDeg == null ? '' : ` ${station.windDeg}°`;
  return `${station.windSpeed} m/s${direction}`;
}

function Metric({ label, value }) {
  return (
    <div
      style={{
        padding: '0.8rem 0.9rem',
        borderRadius: '14px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div style={{ fontSize: '0.74rem', color: 'rgba(248, 250, 252, 0.62)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ marginTop: '0.25rem', fontSize: '1rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default function WeatherWidget() {
  const weather = useSelector((state) => (
    Array.isArray(state.data.byLayer.weather) ? state.data.byLayer.weather : EMPTY_POINTS
  ));
  const airQuality = useSelector((state) => (
    Array.isArray(state.data.byLayer.airQuality) ? state.data.byLayer.airQuality : EMPTY_POINTS
  ));
  const firstStation = weather[0];
  const firstAqi = airQuality[0]?.aqi ?? 0;

  return (
    <section className="sidebar__section">
      <h2>Conditions</h2>
      <p className="sidebar__summary">
        {firstStation
          ? `${firstStation.name}: ${firstStation.temp}°C, ${firstStation.description}.`
          : 'Weather feed idle.'}
      </p>
      {firstStation ? (
        <div
          style={{
            marginTop: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '0.7rem',
          }}
        >
          <Metric label="Feels Like" value={`${firstStation.feelsLike}°C`} />
          <Metric label="Humidity" value={`${firstStation.humidity}%`} />
          <Metric label="Wind" value={formatWind(firstStation)} />
          <Metric label="Pressure" value={`${firstStation.pressure} hPa`} />
          <Metric label="Visibility" value={firstStation.visibility == null ? 'N/A' : `${firstStation.visibility} km`} />
          <Metric label="Air Status" value={aqiToTone(firstAqi)} />
        </div>
      ) : (
        <p className="sidebar__summary">
          Air quality status: <strong>{aqiToTone(firstAqi)}</strong>
        </p>
      )}
    </section>
  );
}
