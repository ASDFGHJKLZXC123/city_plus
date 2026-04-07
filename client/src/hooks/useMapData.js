import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';
import { setData, setLoading, setError } from '../store/dataSlice';
import { useDebounce } from './useDebounce';

const ENDPOINTS = {
  airQuality: 'air-quality',
  weather: 'weather',
  transit: 'transit',
};

export function useMapData() {
  const dispatch = useDispatch();
  const location = useSelector((state) => state.filters.location);
  const activeLayers = useSelector((state) => state.layers.activeLayers);
  const debouncedQuery = useDebounce(location.query);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const enabled = Object.entries(activeLayers).filter(([, enabledFlag]) => enabledFlag);
        const requests = enabled.map(([key]) =>
          api.get(`/${ENDPOINTS[key]}`, { params: { city: debouncedQuery } }).then((response) => ({
            key,
            data: response.data,
          })),
        );

        const responses = await Promise.all(requests);
        if (cancelled) {
          return;
        }

        responses.forEach((payload) => dispatch(setData(payload)));
      } catch (error) {
        if (!cancelled) {
          dispatch(setError(error.message));
        }
      } finally {
        if (!cancelled) {
          dispatch(setLoading(false));
        }
      }
    }

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, [activeLayers, debouncedQuery, dispatch]);
}
