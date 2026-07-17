import { Gift, Languages, Menu, ShoppingBag, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import Logo from '../common/Logo.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStoreData } from '../../context/StoreDataContext.jsx';

const navItems = [
  ['/', 'nav.home'],
  ['/categories', 'nav.categories'],
  ['/products', 'nav.products'],
  ['/about', 'nav.about'],
  ['/contact', 'nav.contact'],
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageControlRef = useRef(null);
  const { pathname } = useLocation();
  const { itemCount } = useCart();
  const { language, languageOptions, setLanguage, t } = useLanguage();
  const { settings } = useStoreData();
  const currentLanguage = languageOptions.find((option) => option.value === language) || languageOptions[0];
  const isCartActive = pathname === '/cart' || pathname === '/checkout';
  const isLoyaltyActive = pathname === '/loyalty';

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsLanguageMenuOpen(false);
  };

  const handleLanguageSelect = (nextLanguage) => {
    setLanguage(nextLanguage);
    closeMenus();
  };

  useEffect(() => {
    if (!isLanguageMenuOpen) {
      return undefined;
    }

    const closeOnOutsideClick = (event) => {
      if (languageControlRef.current && !languageControlRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
    };
  }, [isLanguageMenuOpen]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="header-logo" onClick={closeMenus}>
          <Logo />
        </Link>

        <nav className={`site-nav ${isMenuOpen ? 'site-nav--open' : ''}`} aria-label={t('common.mainNavigation')}>
          {navItems.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
              onClick={closeMenus}
            >
              {t(label)}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {settings.loyalty.enabled && (
            <Link
              to="/loyalty"
              className={`icon-button loyalty-button ${isLoyaltyActive ? 'loyalty-button--active' : ''}`}
              aria-current={isLoyaltyActive ? 'page' : undefined}
              aria-label={t('nav.loyalty')}
              title={t('nav.loyalty')}
              onClick={closeMenus}
            >
              <Gift size={20} aria-hidden="true" />
            </Link>
          )}
          <div className="language-control" ref={languageControlRef}>
            <button
              type="button"
              className="icon-button language-button"
              onClick={() => {
                setIsLanguageMenuOpen((open) => !open);
                setIsMenuOpen(false);
              }}
              aria-label={t('common.switchLanguage')}
              aria-haspopup="menu"
              aria-expanded={isLanguageMenuOpen}
              title={t('common.switchLanguage')}
            >
              <Languages size={19} aria-hidden="true" />
              <span>{currentLanguage.shortLabel}</span>
            </button>
            {isLanguageMenuOpen && (
              <div className="language-menu" role="menu" aria-label={t('common.switchLanguage')}>
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`language-menu__item ${option.value === language ? 'language-menu__item--active' : ''}`}
                    role="menuitemradio"
                    aria-checked={option.value === language}
                    onClick={() => handleLanguageSelect(option.value)}
                  >
                    <span className="language-menu__code">{option.shortLabel}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link
            to="/cart"
            className={`icon-button cart-button ${isCartActive ? 'cart-button--active' : ''}`}
            aria-current={isCartActive ? 'page' : undefined}
            aria-label={t('nav.cart')}
            onClick={closeMenus}
          >
            <ShoppingBag size={20} aria-hidden="true" />
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </Link>
          <button
            type="button"
            className="icon-button menu-button"
            onClick={() => {
              setIsMenuOpen((open) => !open);
              setIsLanguageMenuOpen(false);
            }}
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
