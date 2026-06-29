import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from '../common/Logo.jsx';
import SocialLinks from '../common/SocialLinks.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getCategories } from '../../services/catalogService.js';
import { getLocalizedField } from '../../utils/formatters.js';

export default function Footer() {
  const { language, t } = useLanguage();
  const { pathname, search } = useLocation();
  const categories = getCategories();
  const activeCategory = new URLSearchParams(search).get('category');
  const isCartActive = pathname === '/cart' || pathname === '/checkout';

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>{t('home.description')}</p>
          <SocialLinks compact />
        </div>
        <div>
          <h2>{t('nav.categories')}</h2>
          <ul className="footer-list">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/products?category=${category.slug}`}
                  className={
                    pathname === '/products' && activeCategory === category.slug
                      ? 'footer-link footer-link--active'
                      : 'footer-link'
                  }
                  aria-current={pathname === '/products' && activeCategory === category.slug ? 'page' : undefined}
                >
                  {getLocalizedField(category, 'name', language)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>{t('nav.products')}</h2>
          <ul className="footer-list">
            <li>
              <NavLink
                to="/products"
                className={({ isActive }) => `footer-link ${isActive && !activeCategory ? 'footer-link--active' : ''}`}
                end
              >
                {t('common.shopNow')}
              </NavLink>
            </li>
            <li>
              <Link
                to="/cart"
                className={isCartActive ? 'footer-link footer-link--active' : 'footer-link'}
                aria-current={isCartActive ? 'page' : undefined}
              >
                {t('nav.cart')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2>{t('nav.contact')}</h2>
          <ul className="footer-list">
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) => `footer-link ${isActive ? 'footer-link--active' : ''}`}
              >
                {t('contact.socialTitle')}
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>Copyright {new Date().getFullYear()} Najem Store</span>
      </div>
    </footer>
  );
}
