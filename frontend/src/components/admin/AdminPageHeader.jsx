export default function AdminPageHeader({ title, actions }) {
  return (
    <header className="admin-page-header">
      <div>
        <h1>{title}</h1>
      </div>
      {actions && <div className="admin-page-actions">{actions}</div>}
    </header>
  );
}
