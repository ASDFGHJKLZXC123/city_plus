import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_CITY } from '../constants/cities';

const initialState = {
  location: DEFAULT_CITY,
  timeRange: '24h',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setLocation(state, action) {
      state.location = action.payload;
    },
    setTimeRange(state, action) {
      state.timeRange = action.payload;
    },
  },
});

export const { setLocation, setTimeRange } = filtersSlice.actions;
export default filtersSlice.reducer;
