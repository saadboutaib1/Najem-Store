import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getAdminText } from '../../i18n/admin.js';

export default function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, isChecking } = useAdminAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const ta = (path, fallback) => getAdminText(language, path, fallback);

  if (isChecking) {
    return (
      <div className="admin-screen admin-screen--center">
        <div className="admin-loader" aria-label={ta('common.loading')}>
          <span />
          <p>{ta('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
