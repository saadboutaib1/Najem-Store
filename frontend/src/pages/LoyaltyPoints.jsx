import { BadgePercent, Gift, MessageCircle, Search, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStoreData } from '../context/StoreDataContext.jsx';
import { getLoyaltyPoints } from '../services/api.js';
import { formatCurrency } from '../utils/formatters.js';
import { isBuy2OfferActive } from '../utils/promotions.js';

function formatText(template, values = {}) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    template
  );
}

export default function LoyaltyPoints() {
  const { language, t } = useLanguage();
  const { getWhatsAppUrl, settings } = useStoreData();
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState({ isLoading: false, error: '' });
  const hasActiveBuy2Offer = isBuy2OfferActive(settings.buy2Offer);
  const loyalty = settings.loyalty;
  const whatsappUrl = getWhatsAppUrl();
  const hasNoPointsYet = result && Number(result.total_points || 0) <= 0 && Number(result.total_orders || 0) <= 0;

  function isValidPhone(value) {
    const digits = value.replace(/[^\d]/g, '');

    return digits.length >= 9 && digits.length <= 13;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextPhone = phone.trim();

    if (!nextPhone) {
      setResult(null);
      setStatus({ isLoading: false, error: t('loyalty.required') });
      return;
    }

    if (!isValidPhone(nextPhone)) {
      setResult(null);
      setStatus({ isLoading: false, error: t('loyalty.invalidPhone') });
      return;
    }

    setResult(null);
    setStatus({ isLoading: true, error: '' });

    try {
      const nextResult = await getLoyaltyPoints(nextPhone);
      setResult(nextResult);
      setStatus({ isLoading: false, error: '' });
    } catch {
      setStatus({ isLoading: false, error: t('loyalty.error') });
    }
  }

  return (
    <section className="page-section loyalty-page loyalty-section">
      <div className="container loyalty-layout">
        <div className="loyalty-copy">
          <span className="loyalty-copy__icon" aria-hidden="true">
            <Gift size={26} />
          </span>
          <span className={`loyalty-status-badge ${loyalty.enabled ? 'loyalty-status-badge--active' : ''}`}>
            {loyalty.enabled ? t('loyalty.activeBadge') : t('loyalty.inactiveBadge')}
          </span>
          <h1>{t('loyalty.title')}</h1>
          <p>{t('loyalty.description')}</p>
          <div className="loyalty-benefits" aria-label={t('loyalty.benefitsLabel')}>
            <span>
              <Gift size={18} aria-hidden="true" />
              {formatText(t('loyalty.pointsRule'), {
                amount: formatCurrency(loyalty.amountPerPoint, language, settings.currency),
              })}
            </span>
            <span>
              <BadgePercent size={18} aria-hidden="true" />
              {formatText(t('loyalty.rewardRule'), {
                points: loyalty.rewardPoints,
                reward: formatCurrency(loyalty.rewardValue, language, settings.currency),
              })}
            </span>
            {hasActiveBuy2Offer && (
              <span>
                <BadgePercent size={18} aria-hidden="true" />
                {t('loyalty.buy2Active')}
              </span>
            )}
          </div>
        </div>

        <form className="loyalty-lookup" onSubmit={handleSubmit}>
          <label htmlFor="loyalty-phone">{t('loyalty.phoneLabel')}</label>
          <div className="loyalty-lookup__field">
            <input
              id="loyalty-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={t('loyalty.placeholder')}
              dir="ltr"
            />
            <button className="button button--gold" type="submit" disabled={status.isLoading || !loyalty.enabled}>
              <Search size={18} aria-hidden="true" />
              <span>{status.isLoading ? t('loyalty.checking') : t('loyalty.check')}</span>
            </button>
          </div>

          {!loyalty.enabled && <p className="form-error">{t('loyalty.disabled')}</p>}
          {status.error && <p className="form-error">{status.error}</p>}

          {result && (
            <div className="loyalty-result" aria-live="polite">
              <div className="loyalty-result__headline">
                <span>{t('loyalty.currentPoints')}</span>
                <strong>{result.total_points ?? 0}</strong>
              </div>
              <div className="loyalty-result__grid">
                <span>{t('loyalty.availableDiscount')}</span>
                <strong>{formatCurrency(result.available_discount ?? 0, language, settings.currency)}</strong>
                <span>{t('loyalty.totalOrders')}</span>
                <strong>{result.total_orders ?? 0}</strong>
              </div>
              <p>
                {hasNoPointsYet
                  ? t('loyalty.noPointsYet')
                  : Number(result.available_rewards || 0) > 0
                  ? formatText(t('loyalty.readyReward'), { count: result.available_rewards })
                  : formatText(t('loyalty.nextReward'), { points: result.points_to_next_reward ?? 0 })}
              </p>
              <div className="loyalty-result__actions">
                <Link to="/products" className="button button--gold">
                  <ShoppingBag size={18} aria-hidden="true" />
                  {t('common.shopNow')}
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="button button--outline">
                  <MessageCircle size={18} aria-hidden="true" />
                  {t('common.whatsapp')}
                </a>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
