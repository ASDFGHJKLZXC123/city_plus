import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  byLayer: {},
  loading: false,
  error: null,
  lastUpdated: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setData(state, action) {
      const { key, data } = action.payload;
      state.byLayer[key] = data;
      state.lastUpdated = new Date().toISOString();
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setData, setLoading, setError } = dataSlice.actions;
export default dataSlice.reducer;
