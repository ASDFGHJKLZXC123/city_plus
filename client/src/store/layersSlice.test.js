import reducer, { toggleLayer } from './layersSlice';

describe('layersSlice', () => {
  it('toggles a layer flag', () => {
    const state = reducer(undefined, toggleLayer('transit'));
    expect(state.activeLayers.transit).toBe(true);
  });
});
