export default function Badge({ children, tone = 'default' }) {
  const accent = tone === 'accent';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.35rem 0.7rem',
        borderRadius: '999px',
        fontSize: '0.8rem',
        border: `1px solid ${accent ? 'rgba(251, 146, 60, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
        background: accent ? 'rgba(251, 146, 60, 0.16)' : 'rgba(255, 255, 255, 0.06)',
      }}
    >
      {children}
    </span>
  );
}
