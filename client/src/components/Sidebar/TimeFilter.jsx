import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocation, setTimeRange } from '../../store/filtersSlice';
import { CITY_OPTIONS } from '../../constants/cities';

const OPTIONS = ['6h', '24h', '7d'];
const MAX_SUGGESTIONS = 6;

function filterLocations(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return CITY_OPTIONS.slice(0, MAX_SUGGESTIONS);
  }

  return CITY_OPTIONS.filter((option) => option.label.toLowerCase().includes(normalizedQuery)).slice(
    0,
    MAX_SUGGESTIONS,
  );
}

export default function TimeFilter() {
  const dispatch = useDispatch();
  const { location, timeRange } = useSelector((state) => state.filters);
  const [inputValue, setInputValue] = useState(location.label);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setInputValue(location.label);
  }, [location]);

  const suggestions = useMemo(() => filterLocations(inputValue), [inputValue]);

  function chooseLocation(option) {
    dispatch(setLocation(option));
    setInputValue(option.label);
    setMenuOpen(false);
  }

  return (
    <section className="sidebar__section">
      <h2>Filters</h2>
      <label className="field-label" htmlFor="city-filter">
        Location
      </label>
      <div className="location-picker">
        <input
          id="city-filter"
          className="sidebar__input"
          value={inputValue}
          placeholder="Type a city or state..."
          autoComplete="off"
          onFocus={() => setMenuOpen(true)}
          onChange={(event) => {
            setInputValue(event.target.value);
            setMenuOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && suggestions.length) {
              chooseLocation(suggestions[0]);
            }
            if (event.key === 'Escape') {
              setMenuOpen(false);
              setInputValue(location.label);
            }
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setMenuOpen(false);
              setInputValue(location.label);
            }, 120);
          }}
        />
        {menuOpen && suggestions.length > 0 ? (
          <div className="location-picker__menu" role="listbox" aria-label="Suggested locations">
            {suggestions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`location-picker__option ${option.id === location.id ? 'location-picker__option--active' : ''}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseLocation(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <label className="field-label" htmlFor="time-range">
        Time Range
      </label>
      <select
        id="time-range"
        className="sidebar__input"
        value={timeRange}
        onChange={(event) => dispatch(setTimeRange(event.target.value))}
      >
        {OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </section>
  );
}
