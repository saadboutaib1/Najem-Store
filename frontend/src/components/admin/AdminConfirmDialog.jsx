import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

export default function AdminConfirmDialog({
  cancelLabel,
  confirmLabel,
  isLoading = false,
  message,
  onCancel,
  onConfirm,
  open,
  title,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isLoading) {
        onCancel();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading, onCancel, open]);

  if (!open) return null;

  return (
    <div
      className="admin-confirm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div className="admin-confirm__dialog" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title">
        <button
          className="admin-confirm__close"
          type="button"
          data-no-scroll-top="true"
          onClick={onCancel}
          disabled={isLoading}
          aria-label={cancelLabel}
        >
          <X size={18} />
        </button>

        <div className="admin-confirm__icon" aria-hidden="true">
          <AlertTriangle size={24} />
        </div>

        <div className="admin-confirm__content">
          <h2 id="admin-confirm-title">{title}</h2>
          <p>{message}</p>
        </div>

        <div className="admin-confirm__actions">
          <button className="admin-button admin-button--ghost" type="button" data-no-scroll-top="true" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </button>
          <button className="admin-button admin-button--danger" type="button" data-no-scroll-top="true" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
