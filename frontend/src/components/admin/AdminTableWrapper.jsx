export default function AdminTableWrapper({ children, minWidth = 740 }) {
  return (
    <div className="admin-table-wrap" style={{ '--admin-table-min-width': `${minWidth}px` }}>
      {children}
    </div>
  );
}
