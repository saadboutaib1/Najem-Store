import { Languages, Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import Logo from '../common/Logo.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const navItems = [
  ['/', 'nav.home'],
  ['/categories', 'nav.categories'],
  ['/products', 'nav.products'],
  ['/about', 'nav.about'],
  ['/contact', 'nav.contact'],
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { itemCount } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const nextLanguageLabel = language === 'ar' ? 'English' : 'Arabic';
  const isCartActive = pathname === '/cart' || pathname === '/checkout';

  const handleLanguageToggle = () => {
    toggleLanguage();
    setIsMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="header-logo" onClick={() => setIsMenuOpen(false)}>
          <Logo />
        </Link>

        <nav className={`site-nav ${isMenuOpen ? 'site-nav--open' : ''}`} aria-label={t('common.mainNavigation')}>
          {navItems.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t(label)}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="icon-button language-button"
            onClick={handleLanguageToggle}
            aria-label={`${t('common.switchLanguage')}: ${nextLanguageLabel}`}
          >
            <Languages size={19} aria-hidden="true" />
            <span>{language === 'ar' ? 'EN' : 'AR'}</span>
          </button>
          <Link
            to="/cart"
            className={`icon-button cart-button ${isCartActive ? 'cart-button--active' : ''}`}
            aria-current={isCartActive ? 'page' : undefined}
            aria-label={t('nav.cart')}
          >
            <ShoppingBag size={20} aria-hidden="true" />
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </Link>
          <button
            type="button"
            className="icon-button menu-button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={t('common.toggleNavigation')}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
