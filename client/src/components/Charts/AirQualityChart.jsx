import { useSelector } from 'react-redux';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { aqiToTone } from '../../utils/colorScale';

const EMPTY_POINTS = [];

function getBarColor(aqi) {
  if (aqi <= 50) return '#22c55e';
  if (aqi <= 100) return '#f59e0b';
  if (aqi <= 150) return '#f97316';
  return '#ef4444';
}

function shortenName(name = 'Station') {
  return name.length > 12 ? `${name.slice(0, 12)}...` : name;
}

function buildSeries(points = []) {
  return [...points]
    .sort((left, right) => (right.aqi || 0) - (left.aqi || 0))
    .slice(0, 6)
    .map((point) => ({
      station: shortenName(point.name),
      fullName: point.name || 'Station',
      aqi: Math.round(point.aqi || 0),
      tone: aqiToTone(Math.round(point.aqi || 0)),
    }));
}

export default function AirQualityChart() {
  const points = useSelector((state) => (
    Array.isArray(state.data.byLayer.airQuality) ? state.data.byLayer.airQuality : EMPTY_POINTS
  ));
  const data = buildSeries(points);

  return (
    <div style={{ width: '100%', height: 180 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 6, left: -12, bottom: 8 }}>
          <XAxis
            dataKey="station"
            stroke="#cbd5e1"
            tickLine={false}
            axisLine={false}
            interval={0}
            height={38}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            stroke="#cbd5e1"
            tickLine={false}
            axisLine={false}
            width={28}
            tick={{ fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{ fontSize: '12px', borderRadius: '12px' }}
            itemStyle={{ fontSize: '12px' }}
            labelStyle={{ fontSize: '11px' }}
            formatter={(value, name, payload) => [`AQI ${value} (${payload.payload.tone})`, payload.payload.fullName]}
            labelFormatter={() => 'Most impacted stations'}
          />
          <Bar dataKey="aqi" radius={[8, 8, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.fullName} fill={getBarColor(entry.aqi)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
