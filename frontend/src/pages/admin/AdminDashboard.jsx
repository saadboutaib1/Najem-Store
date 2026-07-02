import { Boxes, ClipboardList, FolderTree, PackagePlus, Settings, ShoppingBag, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getAdminText } from '../../i18n/admin.js';
import { getDashboardStats } from '../../services/adminApi.js';
import { formatCurrency } from '../../utils/formatters.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { language } = useLanguage();
  const ta = (path, fallback) => getAdminText(language, path, fallback);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError('');

      try {
        const nextStats = await getDashboardStats();

        if (isMounted) {
          setStats(nextStats);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(ta('errors.loadDashboard'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = useMemo(
    () => [
      { label: ta('dashboard.totalProducts'), value: stats?.total_products ?? 0, icon: Boxes },
      { label: ta('dashboard.totalCategories'), value: stats?.total_categories ?? 0, icon: FolderTree },
      { label: ta('dashboard.totalOrders'), value: stats?.total_orders ?? 0, icon: ClipboardList },
      { label: ta('dashboard.pendingOrders'), value: stats?.pending_orders ?? 0, icon: ShoppingBag },
      { label: ta('dashboard.deliveredOrders'), value: stats?.delivered_orders ?? 0, icon: TrendingUp },
      {
        label: ta('dashboard.totalRevenue'),
        value: formatCurrency(stats?.total_revenue ?? 0, language),
        icon: TrendingUp,
      },
    ],
    [language, stats, ta]
  );

  return (
    <section className="admin-page">
      <AdminPageHeader title={ta('dashboard.title')} subtitle={ta('dashboard.subtitle')} />

      {error && (
        <div className="admin-alert admin-alert--danger">
          <span>{error}</span>
        </div>
      )}

      <div className="admin-stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <article className="admin-stat-card" key={card.label}>
              <span className="admin-stat-card__icon">
                <Icon size={22} />
              </span>
              <p>{card.label}</p>
              <strong>{isLoading ? '...' : card.value}</strong>
            </article>
          );
        })}
      </div>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <h2>{ta('dashboard.quickActions')}</h2>
        </div>
        <div className="admin-quick-actions admin-quick-actions--grid">
          <Link to="/admin/products/create" className="admin-quick-action">
            <PackagePlus size={20} />
            <span>{ta('dashboard.addProduct')}</span>
          </Link>
          <Link to="/admin/orders" className="admin-quick-action">
            <ClipboardList size={20} />
            <span>{ta('dashboard.viewOrders')}</span>
          </Link>
          <Link to="/admin/settings" className="admin-quick-action">
            <Settings size={20} />
            <span>{ta('dashboard.editSettings')}</span>
          </Link>
        </div>
      </section>
    </section>
  );
}
