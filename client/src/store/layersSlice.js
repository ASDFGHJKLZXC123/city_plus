import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeLayers: {
    airQuality: true,
    weather: true,
    transit: false,
  },
};

const layersSlice = createSlice({
  name: 'layers',
  initialState,
  reducers: {
    toggleLayer(state, action) {
      const key = action.payload;
      state.activeLayers[key] = !state.activeLayers[key];
    },
  },
});

export const { toggleLayer } = layersSlice.actions;
export default layersSlice.reducer;
