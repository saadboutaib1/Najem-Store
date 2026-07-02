export default function AdminCard({ title, actions, children, className = '' }) {
  return (
    <section className={`admin-panel ${className}`.trim()}>
      {(title || actions) && (
        <div className="admin-panel__header">
          {title && <h2>{title}</h2>}
          {actions && <div className="admin-panel__actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
