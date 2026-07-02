import { CheckCircle2, Home, MessageCircle, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStoreData } from '../context/StoreDataContext.jsx';
import { formatCurrency } from '../utils/formatters.js';

function getSavedOrderState() {
  try {
    const savedOrder = sessionStorage.getItem('najem-last-order');
    return savedOrder ? JSON.parse(savedOrder) : null;
  } catch {
    return null;
  }
}

export default function OrderSuccess() {
  const { state } = useLocation();
  const { language, t } = useLanguage();
  const { settings } = useStoreData();
  const order = state || getSavedOrderState();

  if (!order?.orderNumber) {
    return (
      <section className="page-section order-success-page">
        <div className="container order-success-card">
          <span className="order-success__icon" aria-hidden="true">
            <MessageCircle size={34} />
          </span>
          <span className="eyebrow">Najem Store</span>
          <h1>{t('orderSuccess.missingTitle')}</h1>
          <p>{t('orderSuccess.missingText')}</p>
          <div className="order-success__actions">
            <Link to="/products" className="button button--gold">
              <ShoppingBag size={18} aria-hidden="true" />
              {t('orderSuccess.continueShopping')}
            </Link>
            <Link to="/" className="button button--ghost">
              <Home size={18} aria-hidden="true" />
              {t('orderSuccess.backHome')}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section order-success-page">
      <div className="container order-success-card">
        <span className="order-success__icon order-success__icon--success" aria-hidden="true">
          <CheckCircle2 size={38} />
        </span>
        <span className="eyebrow">Najem Store</span>
        <h1>{t('orderSuccess.title')}</h1>
        <p>{t('orderSuccess.subtitle')}</p>

        <div className="order-success__meta" aria-label={t('orderSuccess.title')}>
          <div>
            <span>{t('orderSuccess.orderNumber')}</span>
            <strong>{order.orderNumber}</strong>
          </div>
          <div>
            <span>{t('orderSuccess.total')}</span>
            <strong>{formatCurrency(order.total, language, settings.currency)}</strong>
          </div>
        </div>

        <p className="summary-note">{t('orderSuccess.whatsapp')}</p>

        <div className="order-success__actions">
          <Link to="/products" className="button button--gold">
            <ShoppingBag size={18} aria-hidden="true" />
            {t('orderSuccess.continueShopping')}
          </Link>
          <Link to="/" className="button button--ghost">
            <Home size={18} aria-hidden="true" />
            {t('orderSuccess.backHome')}
          </Link>
        </div>
      </div>
    </section>
  );
}
