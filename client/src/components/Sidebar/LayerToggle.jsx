import { useDispatch, useSelector } from 'react-redux';
import { toggleLayer } from '../../store/layersSlice';

export default function LayerToggle({ label, color, layerKey }) {
  const dispatch = useDispatch();
  const active = useSelector((state) => state.layers.activeLayers[layerKey]);

  return (
    <button
      type="button"
      className={`layer-toggle ${active ? 'layer-toggle--active' : ''}`}
      onClick={() => dispatch(toggleLayer(layerKey))}
    >
      <span className="layer-toggle__swatch" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </button>
  );
}
