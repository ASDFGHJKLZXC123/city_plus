export default function Button({ children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      style={{
        border: 'none',
        borderRadius: '999px',
        padding: '0.7rem 1rem',
        background: '#f97316',
        color: '#0f172a',
        fontWeight: 700,
      }}
    >
      {children}
    </button>
  );
}
