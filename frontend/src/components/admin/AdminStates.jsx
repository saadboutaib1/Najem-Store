import { AlertCircle, Inbox, Loader2 } from 'lucide-react';

export function AdminLoadingState({ message }) {
  return (
    <div className="admin-state">
      <Loader2 className="admin-spin-icon" size={22} />
      <p>{message}</p>
    </div>
  );
}

export function AdminErrorState({ message }) {
  if (!message) return null;

  return (
    <div className="admin-alert admin-alert--danger admin-alert--with-icon">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  );
}

export function AdminEmptyState({ message }) {
  return (
    <div className="admin-state admin-state--empty">
      <Inbox size={24} />
      <p>{message}</p>
    </div>
  );
}
