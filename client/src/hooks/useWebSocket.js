import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setData } from '../store/dataSlice';

export function useWebSocket() {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    const baseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
    const wsUrl = baseUrl.replace('/api', '').replace(/^http/, 'ws');

    socketRef.current = new WebSocket(wsUrl);
    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'AIR_QUALITY_UPDATE') {
        dispatch(setData({ key: 'airQuality', data: message.payload }));
      }
    };

    return () => {
      socketRef.current?.close();
    };
  }, [dispatch]);
}
