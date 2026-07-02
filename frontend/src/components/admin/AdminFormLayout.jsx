export default function AdminFormLayout({ children, onSubmit, actions }) {
  return (
    <form className="admin-form admin-form--grid admin-form--contained" onSubmit={onSubmit}>
      {children}
      {actions && <div className="admin-form-actions admin-form__wide">{actions}</div>}
    </form>
  );
}
