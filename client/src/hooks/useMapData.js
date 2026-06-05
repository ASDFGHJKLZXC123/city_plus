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

function normalizeLayerData(data) {
  return Array.isArray(data) ? data : [];
}

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
            data: normalizeLayerData(response.data),
          })).catch((error) => ({
            key,
            data: [],
            error: error.response?.data?.message || error.message,
          })),
        );

        const responses = await Promise.all(requests);
        if (cancelled) {
          return;
        }

        responses.forEach((payload) => dispatch(setData(payload)));
        const errors = responses.map((payload) => payload.error).filter(Boolean);
        dispatch(setError(errors.length ? errors.join(' · ') : null));
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
