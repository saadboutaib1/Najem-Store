import {
  Boxes,
  ClipboardList,
  FolderTree,
  Gauge,
  Globe2,
  LogOut,
  Menu,
  Settings,
  Store,
  UserRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getAdminText } from '../i18n/admin.js';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAdminAuth();
  const { language, toggleLanguage, direction } = useLanguage();
  const navigate = useNavigate();
  const ta = (path, fallback) => getAdminText(language, path, fallback);

  const navItems = [
    { to: '/admin/dashboard', label: ta('common.dashboard'), icon: Gauge },
    { to: '/admin/products', label: ta('common.products'), icon: Boxes },
    { to: '/admin/categories', label: ta('common.categories'), icon: FolderTree },
    { to: '/admin/orders', label: ta('common.orders'), icon: ClipboardList },
    { to: '/admin/settings', label: ta('common.settings'), icon: Settings },
    { to: '/admin/profile', label: ta('common.profile'), icon: UserRound },
  ];

  async function handleLogout() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-shell" dir={direction}>
      <aside
        id="admin-sidebar"
        className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}
        data-open={sidebarOpen ? 'true' : 'false'}
      >
        <div className="admin-sidebar__brand">
          <Logo />
          <button
            className="admin-icon-button admin-sidebar__close"
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label={ta('common.closeMenu')}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="admin-nav" aria-label={ta('common.admin')}>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <Link className="admin-nav__link admin-nav__link--store" to="/" onClick={() => setSidebarOpen(false)}>
          <Store size={18} />
          <span>{ta('common.backToStore')}</span>
        </Link>
      </aside>

      {sidebarOpen && <button className="admin-overlay" type="button" aria-label={ta('common.closeMenu')} onClick={() => setSidebarOpen(false)} />}

      <div className="admin-content">
        <header className="admin-topbar">
          <button
            className="admin-icon-button admin-menu-button"
            type="button"
            onClick={() => setSidebarOpen((current) => !current)}
            aria-label={ta('common.openMenu')}
            aria-controls="admin-sidebar"
            aria-expanded={sidebarOpen}
          >
            <Menu size={20} />
          </button>

          <div className="admin-topbar__title">
            <span>{ta('common.admin')}</span>
            <strong>{admin?.name || 'Najem Store'}</strong>
          </div>

          <div className="admin-topbar__actions">
            <button className="admin-topbar-button admin-topbar-button--language" type="button" onClick={toggleLanguage} aria-label={ta('common.switchLanguage')}>
              <Globe2 size={16} />
              <span>{language === 'ar' ? 'EN' : 'AR'}</span>
            </button>
            <button className="admin-topbar-button admin-topbar-button--danger" type="button" onClick={handleLogout}>
              <LogOut size={16} />
              <span>{ta('common.logout')}</span>
            </button>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
