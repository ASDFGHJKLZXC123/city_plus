import { configureStore } from '@reduxjs/toolkit';
import layersReducer from './layersSlice';
import filtersReducer from './filtersSlice';
import dataReducer from './dataSlice';

export const store = configureStore({
  reducer: {
    layers: layersReducer,
    filters: filtersReducer,
    data: dataReducer,
  },
});
