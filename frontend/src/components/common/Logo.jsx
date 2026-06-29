export default function Logo({ compact = false }) {
  return (
    <span className={`logo ${compact ? 'logo--compact' : ''}`} aria-label="Najem Store">
      <svg className="logo__mark" viewBox="0 0 80 80" role="img" aria-hidden="true">
        <circle cx="40" cy="40" r="35" fill="#0B0B0B" stroke="#C8A24A" strokeWidth="3" />
        <path
          d="M40 10L46 29H66L49.8 40.8L56 60L40 48.2L24 60L30.2 40.8L14 29H34L40 10Z"
          fill="#C8A24A"
        />
        <path
          d="M31 43H49L53 64C53.5 67 51.1 70 48 70H32C28.9 70 26.5 67 27 64L31 43Z"
          fill="#0B0B0B"
          stroke="#F7EFE2"
          strokeWidth="2"
        />
        <path
          d="M58 19C51 27 51 34 58 42C64 49 63 57 56 64"
          stroke="#F7EFE2"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>
      {!compact && (
        <span className="logo__text">
          <strong>Najem</strong>
          <span>Store</span>
        </span>
      )}
    </span>
  );
}
