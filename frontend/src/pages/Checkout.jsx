import { MessageCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BackButton from '../components/common/BackButton.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStoreData } from '../context/StoreDataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { createOrder } from '../services/api.js';
import { getBackendProductId } from '../utils/adapters.js';
import { reconcileCartItemsFromBackend } from '../utils/cartReconciliation.js';
import { formatCurrency, getLocalizedField } from '../utils/formatters.js';
import { calculateBuy2Discount, calculateLoyaltyPoints } from '../utils/promotions.js';
import { isValidPhoneNumber } from '../utils/validation.js';
import { createWhatsAppOrderUrl } from '../utils/whatsapp.js';

const initialForm = {
  fullName: '',
  phone: '',
  city: '',
  address: '',
  notes: '',
};

export default function Checkout() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [cartRefreshMessage, setCartRefreshMessage] = useState('');
  const [isRefreshingCart, setIsRefreshingCart] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items, subtotal, replaceCartItems, clearCart } = useCart();
  const { language, t } = useLanguage();
  const { settings } = useStoreData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const deliveryFee = settings.deliveryFee;
  const discountTotal = calculateBuy2Discount(items, settings.buy2Offer);
  const discountedSubtotal = Math.max(0, subtotal - discountTotal);
  const total = discountedSubtotal + deliveryFee;
  const expectedPoints = calculateLoyaltyPoints(discountedSubtotal, settings.loyalty);
  const orderErrorMessage = t('checkout.orderError');
  const submittingText = t('checkout.submitting');
  const needsCartRefresh = items.some((item) => !getBackendProductId(item));

  const updateField = (field, value) => {
    setError('');
    setCartRefreshMessage('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const refreshCartFromBackend = async () => {
    setError('');
    setCartRefreshMessage('');
    setIsRefreshingCart(true);

    try {
      const result = await reconcileCartItemsFromBackend(items);

      if (result.changed) {
        replaceCartItems(result.items);
      }

      if (result.unresolvedItems.length > 0) {
        setError(t('checkout.cartRefreshFailed'));
        return { success: false, items: result.items };
      }

      setCartRefreshMessage(t('checkout.cartRefreshSuccess'));
      return { success: true, items: result.items };
    } catch {
      setError(t('checkout.backendOffline'));
      return { success: false, items };
    } finally {
      setIsRefreshingCart(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (items.length === 0) {
      setError(t('checkout.emptyCart'));
      return;
    }

    if (!form.fullName.trim() || !form.phone.trim() || !form.city.trim() || !form.address.trim()) {
      setError(t('checkout.validation'));
      return;
    }

    if (!isValidPhoneNumber(form.phone)) {
      setError(t('checkout.invalidPhone'));
      return;
    }

    let checkoutItems = items;

    if (checkoutItems.some((item) => !getBackendProductId(item))) {
      const refreshResult = await refreshCartFromBackend();

      if (!refreshResult.success) {
        return;
      }

      checkoutItems = refreshResult.items;
    }

    setIsSubmitting(true);

    try {
      const response = await createOrder({
        customer_name: form.fullName.trim(),
        customer_phone: form.phone.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
        items: checkoutItems.map((item) => ({
          product_id: getBackendProductId(item),
          quantity: item.quantity,
        })),
      });

      const order = response.data || {};
      const orderNumber = response.order_number || order.order_number;
      const orderSubtotal = Number(order.subtotal ?? subtotal);
      const orderDeliveryFee = Number(order.delivery_fee ?? deliveryFee);
      const orderDiscountTotal = Number(order.discount_total ?? discountTotal);
      const orderTotal = Number(order.total ?? total);
      const whatsappUrl = createWhatsAppOrderUrl({
        orderNumber,
        customer: form,
        items: checkoutItems,
        subtotal: orderSubtotal,
        deliveryFee: orderDeliveryFee,
        discountTotal: orderDiscountTotal,
        total: orderTotal,
        language,
        currency: settings.currency,
        whatsappNumber: settings.whatsappNumber,
      });
      const successState = {
        orderNumber,
        subtotal: orderSubtotal,
        deliveryFee: orderDeliveryFee,
        discountTotal: orderDiscountTotal,
        total: orderTotal,
        loyaltyPointsEarned: Number(order.loyalty_points_earned ?? 0),
      };

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      try {
        sessionStorage.setItem('maghrib-oud-last-order', JSON.stringify(successState));
      } catch {
        // Session storage is optional; the success page can still render from route state.
      }
      clearCart();
      setForm(initialForm);
      showToast(t('checkout.orderSuccess'));
      navigate('/order-success', { replace: true, state: successState });
    } catch {
      setError(orderErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="page-section checkout-page">
        <div className="container empty-panel">
          <MessageCircle size={44} aria-hidden="true" />
          <h1>{t('checkout.title')}</h1>
          <p>{t('checkout.emptyCart')}</p>
          <Link to="/products" className="button button--gold">
            {t('common.continueShopping')}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section checkout-page">
      <div className="container section-heading">
        <span className="eyebrow">{t('common.cashOnDelivery')}</span>
        <h1>{t('checkout.title')}</h1>
        <p>{t('checkout.subtitle')}</p>
        <div className="page-actions">
          <BackButton fallbackTo="/cart" label={t('common.backToCart')} />
        </div>
      </div>

      <div className="container checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <h2>{t('checkout.customerInfo')}</h2>
          <label>
            <span>{t('checkout.fullName')}</span>
            <input
              name="fullName"
              value={form.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              autoComplete="name"
              dir="auto"
              required
            />
          </label>
          <label>
            <span>{t('checkout.phone')}</span>
            <input
              name="phone"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              dir="ltr"
              required
            />
          </label>
          <label>
            <span>{t('checkout.city')}</span>
            <input
              name="city"
              value={form.city}
              onChange={(event) => updateField('city', event.target.value)}
              autoComplete="address-level2"
              dir="auto"
              required
            />
          </label>
          <label>
            <span>{t('checkout.address')}</span>
            <textarea
              name="address"
              value={form.address}
              onChange={(event) => updateField('address', event.target.value)}
              rows="4"
              autoComplete="street-address"
              dir="auto"
              required
            />
          </label>
          <label>
            <span>{t('checkout.notes')}</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              rows="3"
              dir="auto"
            />
          </label>
          {error && <p className="form-error" aria-live="polite">{error}</p>}
          {cartRefreshMessage && <p className="summary-note summary-note--form">{cartRefreshMessage}</p>}
          {needsCartRefresh && (
            <button
              type="button"
              className="button button--outline button--full"
              onClick={refreshCartFromBackend}
              disabled={isSubmitting || isRefreshingCart}
            >
              {isRefreshingCart ? t('checkout.refreshingCart') : t('checkout.refreshCartFromBackend')}
            </button>
          )}
          <p className="summary-note summary-note--form">{t('checkout.whatsappNote')}</p>
          {expectedPoints > 0 && (
            <p className="summary-note summary-note--form summary-note--success">
              {t('checkout.expectedPoints').replace('{points}', expectedPoints)}
            </p>
          )}
          <button type="submit" className="button button--gold button--full" disabled={isSubmitting}>
            <MessageCircle size={19} aria-hidden="true" />
            {isSubmitting ? submittingText : t('checkout.whatsappOrder')}
          </button>
        </form>

        <aside className="summary-panel">
          <div className="summary-panel__header">
            <ShieldCheck size={22} aria-hidden="true" />
            <h2>{t('checkout.orderSummary')}</h2>
          </div>
          <div className="checkout-products">
            {items.map((item) => (
              <div className="checkout-product" key={item.id}>
                <span>
                  {getLocalizedField(item, 'name', language)} x {item.quantity}
                </span>
                <strong>{formatCurrency(item.price * item.quantity, language, settings.currency)}</strong>
              </div>
            ))}
          </div>
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
          <div className="summary-row">
            <span>{t('common.deliveryFee')}</span>
            <strong>{formatCurrency(deliveryFee, language, settings.currency)}</strong>
          </div>
          <div className="summary-row summary-row--total">
            <span>{t('common.total')}</span>
            <strong>{formatCurrency(total, language, settings.currency)}</strong>
          </div>
          <div className="payment-note">
            <span>{t('common.paymentMethod')}</span>
            <strong>{t('common.cashOnDelivery')}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}