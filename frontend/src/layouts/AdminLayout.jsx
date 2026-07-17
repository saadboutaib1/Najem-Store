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
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getAdminText } from '../i18n/admin.js';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageControlRef = useRef(null);
  const { admin, logout } = useAdminAuth();
  const { language, languageOptions, setLanguage, direction } = useLanguage();
  const navigate = useNavigate();
  const ta = (path, fallback) => getAdminText(language, path, fallback);
  const currentLanguage = languageOptions.find((option) => option.value === language) || languageOptions[0];

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

  function handleLanguageSelect(nextLanguage) {
    setLanguage(nextLanguage);
    setLanguageMenuOpen(false);
    setSidebarOpen(false);
  }

  useEffect(() => {
    if (!languageMenuOpen) {
      return undefined;
    }

    const closeOnOutsideClick = (event) => {
      if (languageControlRef.current && !languageControlRef.current.contains(event.target)) {
        setLanguageMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
    };
  }, [languageMenuOpen]);

  return (
    <div className="admin-shell" dir={direction} data-text-direction={direction}>
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
                onClick={() => {
                  setSidebarOpen(false);
                  setLanguageMenuOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <Link
          className="admin-nav__link admin-nav__link--store"
          to="/"
          onClick={() => {
            setSidebarOpen(false);
            setLanguageMenuOpen(false);
          }}
        >
          <Store size={18} />
          <span>{ta('common.backToStore')}</span>
        </Link>
      </aside>

      {sidebarOpen && (
        <button
          className="admin-overlay"
          type="button"
          aria-label={ta('common.closeMenu')}
          onClick={() => {
            setSidebarOpen(false);
            setLanguageMenuOpen(false);
          }}
        />
      )}

      <div className="admin-content">
        <header className="admin-topbar">
          <button
            className="admin-icon-button admin-menu-button"
            type="button"
            onClick={() => {
              setSidebarOpen((current) => !current);
              setLanguageMenuOpen(false);
            }}
            aria-label={ta('common.openMenu')}
            aria-controls="admin-sidebar"
            aria-expanded={sidebarOpen}
          >
            <Menu size={20} />
          </button>

          <div className="admin-topbar__title">
            <span>{ta('common.admin')}</span>
            <strong>{admin?.name || 'MAGHRIB OUD'}</strong>
          </div>

          <div className="admin-topbar__actions">
            <div className="admin-language-control" ref={languageControlRef}>
              <button
                className="admin-topbar-button admin-topbar-button--language"
                type="button"
                onClick={() => setLanguageMenuOpen((open) => !open)}
                aria-label={ta('common.switchLanguage')}
                aria-haspopup="menu"
                aria-expanded={languageMenuOpen}
              >
                <Globe2 size={16} />
                <span>{currentLanguage.shortLabel}</span>
              </button>
              {languageMenuOpen && (
                <div className="admin-language-menu" role="menu" aria-label={ta('common.switchLanguage')}>
                  {languageOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`admin-language-menu__item ${option.value === language ? 'admin-language-menu__item--active' : ''}`}
                      role="menuitemradio"
                      aria-checked={option.value === language}
                      onClick={() => handleLanguageSelect(option.value)}
                    >
                      <span className="admin-language-menu__code">{option.shortLabel}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
