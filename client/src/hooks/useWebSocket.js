import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setData } from '../store/dataSlice';

export function useWebSocket() {
  const dispatch = useDispatch();
  const selectedCity = useSelector((state) => state.filters.location?.query ?? 'San Francisco,CA,US');
  const socketRef = useRef(null);

  // Send SET_CITY whenever the selected city changes (socket already open)
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'SET_CITY', city: selectedCity }));
    }
  }, [selectedCity]);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
    const wsUrl = baseUrl.replace('/api', '').replace(/^http/, 'ws');

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'SET_CITY', city: selectedCity }));
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
