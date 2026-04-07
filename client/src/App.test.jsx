import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './store';

jest.mock('./components/Map/MapView', () => () => <div>Map Placeholder</div>);
jest.mock('./components/Sidebar/Sidebar', () => () => <div>CityPulse</div>);
jest.mock('./hooks/useMapData', () => ({ useMapData: jest.fn() }));
jest.mock('./hooks/useWebSocket', () => ({ useWebSocket: jest.fn() }));

describe('App', () => {
  it('renders dashboard chrome', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    expect(screen.getByText(/CityPulse/i)).toBeInTheDocument();
    expect(screen.getByText(/Map Placeholder/i)).toBeInTheDocument();
    expect(screen.getByText(/Realtime feed/i)).toBeInTheDocument();
  });
});
