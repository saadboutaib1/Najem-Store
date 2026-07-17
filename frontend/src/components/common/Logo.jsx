export default function Logo({ compact = false, full = false }) {
  const source = full ? '/brand/maghrib-oud-logo-transparent.png' : '/brand/maghrib-oud-wordmark.png';

  return (
    <span className={`logo ${compact ? 'logo--compact' : ''} ${full ? 'logo--full' : ''}`} aria-label="MAGHRIB OUD">
      <img className="logo__image" src={source} alt="" aria-hidden="true" />
    </span>
  );
}
