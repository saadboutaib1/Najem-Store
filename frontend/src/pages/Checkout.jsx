import { MessageCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../components/common/BackButton.jsx';
import { STORE_CONFIG } from '../config/store.js';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatCurrency, getLocalizedField } from '../utils/formatters.js';
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
  const { items, subtotal } = useCart();
  const { language, t } = useLanguage();
  const deliveryFee = STORE_CONFIG.deliveryFee;
  const total = subtotal + deliveryFee;

  const updateField = (field, value) => {
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
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

    const whatsappUrl = createWhatsAppOrderUrl({
      customer: form,
      items,
      subtotal,
      deliveryFee,
      total,
      language,
    });

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
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
            />
          </label>
          {error && <p className="form-error" aria-live="polite">{error}</p>}
          <p className="summary-note summary-note--form">{t('checkout.whatsappNote')}</p>
          <button type="submit" className="button button--gold button--full">
            <MessageCircle size={19} aria-hidden="true" />
            {t('checkout.whatsappOrder')}
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
                <strong>{formatCurrency(item.price * item.quantity, language)}</strong>
              </div>
            ))}
          </div>
          <div className="summary-row">
            <span>{t('common.subtotal')}</span>
            <strong>{formatCurrency(subtotal, language)}</strong>
          </div>
          <div className="summary-row">
            <span>{t('common.deliveryFee')}</span>
            <strong>{formatCurrency(deliveryFee, language)}</strong>
          </div>
          <div className="summary-row summary-row--total">
            <span>{t('common.total')}</span>
            <strong>{formatCurrency(total, language)}</strong>
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
