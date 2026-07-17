import { ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '../components/common/BackButton.jsx';
import QuantityStepper from '../components/common/QuantityStepper.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStoreData } from '../context/StoreDataContext.jsx';
import { getProductImageFallback } from '../utils/adapters.js';
import { formatCurrency, getLocalizedField } from '../utils/formatters.js';
import { calculateBuy2Discount, calculateLoyaltyPoints, isBuy2OfferActive } from '../utils/promotions.js';

export default function Cart() {
  const {
    items,
    subtotal,
    clearCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();
  const { language, t } = useLanguage();
  const { settings } = useStoreData();
  const discountTotal = calculateBuy2Discount(items, settings.buy2Offer);
  const discountedSubtotal = Math.max(0, subtotal - discountTotal);
  const expectedPoints = calculateLoyaltyPoints(discountedSubtotal, settings.loyalty);
  const hasActiveOffer = isBuy2OfferActive(settings.buy2Offer);
  const handleImageError = (item) => (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = getProductImageFallback(item.category);
  };

  if (items.length === 0) {
    return (
      <section className="page-section cart-page">
        <div className="container empty-panel">
          <ShoppingBag size={44} aria-hidden="true" />
          <h1>{t('cart.emptyTitle')}</h1>
          <Link to="/products" className="button button--gold">
            {t('common.continueShopping')}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section cart-page">
      <div className="container section-heading">
        <span className="eyebrow">MAGHRIB OUD</span>
        <h1>{t('cart.title')}</h1>
        <div className="page-actions">
          <BackButton fallbackTo="/products" />
        </div>
      </div>

      <div className="container cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <article className="cart-item" key={item.id}>
              <img
                src={item.image}
                alt={getLocalizedField(item, 'name', language)}
                onError={handleImageError(item)}
              />
              <div className="cart-item__content">
                <h2>{getLocalizedField(item, 'name', language)}</h2>
                <span>{formatCurrency(item.price, language, settings.currency)}</span>
                <QuantityStepper
                  value={item.quantity}
                  max={item.stock}
                  label={t('common.quantity')}
                  increaseLabel={t('common.increaseQuantity')}
                  decreaseLabel={t('common.decreaseQuantity')}
                  onIncrease={() => increaseQuantity(item)}
                  onDecrease={() => decreaseQuantity(item)}
                />
              </div>
              <div className="cart-item__total">
                <strong>{formatCurrency(item.price * item.quantity, language, settings.currency)}</strong>
                <button
                  type="button"
                  className="icon-button icon-button--danger"
                  onClick={() => removeFromCart(item)}
                  aria-label={t('common.remove')}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="summary-panel">
          <h2>{t('cart.summary')}</h2>
          <div className="summary-row">
            <span>{t('common.subtotal')}</span>
            <strong>{formatCurrency(subtotal, language, settings.currency)}</strong>
          </div>
          {discountTotal > 0 && (
            <div className="summary-row summary-row--discount">
              <span>{t('cart.discountLabel')}</span>
              <strong>-{formatCurrency(discountTotal, language, settings.currency)}</strong>
            </div>
          )}
          <div className="summary-row summary-row--total">
            <span>{t('cart.totalBeforeDelivery')}</span>
            <strong>{formatCurrency(discountedSubtotal, language, settings.currency)}</strong>
          </div>
          {hasActiveOffer && discountTotal <= 0 && (
            <p className="summary-note summary-note--success">
              {t('cart.unlockBuy2Discount')}
            </p>
          )}
          {expectedPoints > 0 && (
            <p className="summary-note summary-note--success">
              {t('cart.expectedPoints').replace('{points}', expectedPoints)}
            </p>
          )}
          <p className="summary-note">{t('cart.deliveryNote')}</p>
          <Link to="/checkout" className="button button--gold button--full">
            {t('common.checkout')}
          </Link>
          <button type="button" className="button button--ghost button--full" onClick={clearCart}>
            <Trash2 size={18} aria-hidden="true" />
            {t('common.clearCart')}
          </button>
        </aside>
      </div>
    </section>
  );
}