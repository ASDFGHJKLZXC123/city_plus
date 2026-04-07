export function tempToColor(temp) {
  if (temp < 0) return [61, 130, 246, 210];
  if (temp < 15) return [32, 194, 175, 210];
  if (temp < 25) return [251, 191, 36, 210];
  return [248, 113, 113, 210];
}

export function aqiToTone(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Sensitive';
  return 'Poor';
}
