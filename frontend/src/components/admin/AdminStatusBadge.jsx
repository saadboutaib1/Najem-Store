const statusClassMap = {
  active: 'success',
  delivered: 'success',
  confirmed: 'success',
  pending: 'warning',
  preparing: 'warning',
  shipped: 'info',
  inactive: 'muted',
  cancelled: 'danger',
};

export default function AdminStatusBadge({ status, label }) {
  const tone = statusClassMap[status] || 'muted';

  return <span className={`admin-badge admin-badge--${tone}`}>{label || status}</span>;
}
