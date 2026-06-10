import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from '../store/dataSlice';

export function useWebSocket() {
  const dispatch = useDispatch();
  // Read the full location object so we have lat/lon as well as the query string.
  const location = useSelector((state) => state.filters.location);
  const socketRef = useRef(null);

  const buildSetCityMessage = (loc) =>
    JSON.stringify({
      type: 'SET_CITY',
      city: loc?.query ?? 'San Francisco,CA,US',
      lat: loc?.latitude ?? 37.7749,
      lon: loc?.longitude ?? -122.4194,
    });

  // Send SET_CITY whenever the selected city changes (socket already open).
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(buildSetCityMessage(location));
    }
  }, [location]);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
    const wsUrl = baseUrl.replace('/api', '').replace(/^http/, 'ws');

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(buildSetCityMessage(location));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'AIR_QUALITY_UPDATE') {
        dispatch(setData({ key: 'airQuality', data: message.payload }));
      }
    };

    return () => {
      socket.close();
    };
    // Only re-create the socket on mount/unmount; city changes are handled
    // by the effect above via the open socket.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
}
