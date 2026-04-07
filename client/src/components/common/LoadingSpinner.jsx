import { useSelector } from 'react-redux';

export default function LoadingSpinner() {
  const loading = useSelector((state) => state.data.loading);
  const error = useSelector((state) => state.data.error);

  if (error) {
    return <div style={{ color: '#fca5a5' }}>{error}</div>;
  }

  if (!loading) {
    return null;
  }

  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: '999px',
        border: '3px solid rgba(255, 255, 255, 0.18)',
        borderTopColor: '#f97316',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
}
