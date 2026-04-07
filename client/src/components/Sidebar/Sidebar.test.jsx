import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Sidebar from './Sidebar';
import layersReducer from '../../store/layersSlice';
import filtersReducer from '../../store/filtersSlice';
import dataReducer from '../../store/dataSlice';

jest.mock('../Charts/AirQualityChart', () => () => <div>Air Quality Chart</div>);
jest.mock('../Charts/WeatherWidget', () => () => <div>Weather Widget</div>);

function renderWithStore() {
  const store = configureStore({
    reducer: { layers: layersReducer, filters: filtersReducer, data: dataReducer },
  });

  render(
    <Provider store={store}>
      <Sidebar />
    </Provider>,
  );

  return store;
}

describe('Sidebar', () => {
  it('renders all layer toggles', () => {
    renderWithStore();
    expect(screen.getByText('Air Quality')).toBeInTheDocument();
    expect(screen.getByText('Weather')).toBeInTheDocument();
    expect(screen.getByText('Transit Hubs')).toBeInTheDocument();
  });

  it('toggles weather on click', () => {
    const store = renderWithStore();
    fireEvent.click(screen.getByText('Weather'));
    expect(store.getState().layers.activeLayers.weather).toBe(false);
  });

  it('updates city input', () => {
    const store = renderWithStore();
    fireEvent.focus(screen.getByLabelText('Location'));
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Austin' } });
    fireEvent.click(screen.getByText('Austin, Texas, USA'));
    expect(store.getState().filters.location.label).toBe('Austin, Texas, USA');
  });
});
