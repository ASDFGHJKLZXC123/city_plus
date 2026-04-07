import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AirQualityChart from './AirQualityChart';
import WeatherWidget from './WeatherWidget';
import layersReducer from '../../store/layersSlice';
import filtersReducer from '../../store/filtersSlice';
import dataReducer from '../../store/dataSlice';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: ({ children }) => <div>Bar{children}</div>,
  Cell: () => <div>Cell</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  Tooltip: () => <div>Tooltip</div>,
}));

function createStore() {
  return configureStore({
    reducer: { layers: layersReducer, filters: filtersReducer, data: dataReducer },
    preloadedState: {
      data: {
        byLayer: {
          weather: [
            {
              name: 'Civic Center',
              temp: 21,
              condition: 'Clear',
              description: 'clear sky',
              feelsLike: 23,
              humidity: 61,
              pressure: 1014,
              windSpeed: 5,
              windDeg: 270,
              visibility: 10,
            },
          ],
          airQuality: [{ name: 'Market Street', aqi: 42 }],
        },
        loading: false,
        error: null,
        lastUpdated: null,
      },
    },
  });
}

describe('Charts', () => {
  it('renders chart shell', () => {
    render(
      <Provider store={createStore()}>
        <AirQualityChart />
      </Provider>,
    );

    expect(screen.getByText(/Bar/i)).toBeInTheDocument();
  });

  it('renders weather summary', () => {
    render(
      <Provider store={createStore()}>
        <WeatherWidget />
      </Provider>,
    );

    expect(screen.getByText(/Civic Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Good/i)).toBeInTheDocument();
    expect(screen.getByText(/Humidity/i)).toBeInTheDocument();
    expect(screen.getByText(/61%/i)).toBeInTheDocument();
  });
});
