import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MapView from './MapView';
import layersReducer from '../../store/layersSlice';
import filtersReducer from '../../store/filtersSlice';
import dataReducer from '../../store/dataSlice';

jest.mock('@deck.gl/react', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('react-map-gl', () => ({ __esModule: true, default: () => <div>Mapbox</div> }));
jest.mock('./LayerFactory', () => ({ LayerFactory: () => [] }));

describe('MapView', () => {
  it('shows token fallback without mapbox env', () => {
    const store = configureStore({
      reducer: { layers: layersReducer, filters: filtersReducer, data: dataReducer },
    });

    render(
      <Provider store={store}>
        <MapView />
      </Provider>,
    );

    expect(screen.getByText(/Mapbox is not configured/i)).toBeInTheDocument();
  });
});
