import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminCard from '../../components/admin/AdminCard.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import AdminSelect from '../../components/admin/AdminSelect.jsx';
import { AdminErrorState, AdminLoadingState } from '../../components/admin/AdminStates.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStoreData } from '../../context/StoreDataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getAdminText } from '../../i18n/admin.js';
import { getSettings, getSocialLinks, updateSettings, updateSocialLinks } from '../../services/adminApi.js';
import { getCurrencyLabel } from '../../utils/formatters.js';
import { buildWhatsAppLink } from '../../utils/whatsappLink.js';

const emptySettingsForm = {
  store_name: '',
  whatsapp_number: '',
  currency: 'MAD',
  delivery_fee: 0,
  default_language: 'ar',
  payment_method: 'cash_on_delivery',
  country: 'Morocco',
  facebook: '',
  instagram: '',
  tiktok: '',
  youtube: '',
  whatsapp: '',
  buy2_offer_enabled: false,
  buy2_offer_starts_at: '',
  buy2_offer_ends_at: '',
  buy2_discount_type: 'percentage',
  buy2_discount_value: 10,
  loyalty_points_enabled: true,
  loyalty_amount_per_point: 10,
  loyalty_reward_points: 100,
  loyalty_reward_value: 20,
};

function linksToMap(links = []) {
  return links.reduce((map, link) => ({ ...map, [link.platform]: link.url }), {});
}

function buildDashboardWhatsAppLink(phoneNumber) {
  const link = buildWhatsAppLink(phoneNumber);
  return link === '#' ? '' : link;
}

function toBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function formatDateTimeLocal(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 16);
  }

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function getDateFromLocalValue(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeOfferDateFields(settings = {}) {
  const startsAt = formatDateTimeLocal(settings.buy2_offer_starts_at);
  const endsAt = formatDateTimeLocal(settings.buy2_offer_ends_at);
  const startDate = getDateFromLocalValue(startsAt);
  const endDate = getDateFromLocalValue(endsAt);

  if (startDate && endDate && endDate < startDate) {
    return { startsAt: endsAt, endsAt: startsAt };
  }

  return { startsAt, endsAt };
}

function hasInvalidOfferDateRange(form) {
  const startDate = getDateFromLocalValue(form.buy2_offer_starts_at);
  const endDate = getDateFromLocalValue(form.buy2_offer_ends_at);
  return Boolean(startDate && endDate && endDate < startDate);
}

export default function AdminSettings() {
  const [form, setForm] = useState(emptySettingsForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { language } = useLanguage();
  const { refreshStoreData } = useStoreData();
  const { showToast } = useToast();
  const ta = (path, fallback) => getAdminText(language, path, fallback);
  const languageOptions = [
    { value: 'ar', label: ta('settings.arabic') },
    { value: 'fr', label: ta('settings.french') },
    { value: 'en', label: ta('settings.english') },
  ];
  const discountTypeOptions = [
    { value: 'percentage', label: ta('settings.percentageDiscount') },
    { value: 'fixed', label: ta('settings.fixedDiscount') },
  ];

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      setIsLoading(true);
      setError('');

      try {
        const [settingsResponse, socialLinks] = await Promise.all([getSettings(), getSocialLinks()]);
        const settings = settingsResponse?.settings || settingsResponse || {};
        const linkMap = linksToMap(settingsResponse?.social_links || socialLinks || []);

        if (isMounted) {
          const offerDates = normalizeOfferDateFields(settings);

          setForm({
            ...emptySettingsForm,
            ...settings,
            facebook: settings.facebook || linkMap.facebook || '',
            instagram: settings.instagram || linkMap.instagram || '',
            tiktok: settings.tiktok || linkMap.tiktok || '',
            youtube: settings.youtube || linkMap.youtube || '',
            whatsapp: buildDashboardWhatsAppLink(settings.whatsapp_number || settings.whatsappNumber) || linkMap.whatsapp || '',
            buy2_offer_enabled: toBoolean(settings.buy2_offer_enabled),
            buy2_offer_starts_at: offerDates.startsAt,
            buy2_offer_ends_at: offerDates.endsAt,
            buy2_discount_type: settings.buy2_discount_type || 'percentage',
            buy2_discount_value: settings.buy2_discount_value ?? 10,
            loyalty_points_enabled: settings.loyalty_points_enabled === undefined ? true : toBoolean(settings.loyalty_points_enabled),
            loyalty_amount_per_point: settings.loyalty_amount_per_point ?? 10,
            loyalty_reward_points: settings.loyalty_reward_points ?? 100,
            loyalty_reward_value: settings.loyalty_reward_value ?? 20,
          });
        }
      } catch {
        if (isMounted) {
          setError(ta('errors.loadSettings'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateField(event) {
    const { name, type, checked, value } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setForm((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === 'whatsapp_number' ? { whatsapp: buildDashboardWhatsAppLink(nextValue) } : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.whatsapp_number.trim()) {
      setError(ta('common.validationRequired'));
      return;
    }

    if (Number(form.delivery_fee || 0) < 0) {
      setError(ta('common.validationNonNegative'));
      return;
    }

    if (form.buy2_offer_enabled && Number(form.buy2_discount_value || 0) <= 0) {
      setError(ta('settings.offerValidation'));
      return;
    }

    if (form.buy2_offer_enabled && hasInvalidOfferDateRange(form)) {
      setError(ta('settings.offerDateValidation'));
      return;
    }

    setIsSaving(true);
    const whatsappLink = buildDashboardWhatsAppLink(form.whatsapp_number);

    const payload = {
      whatsapp_number: form.whatsapp_number,
      delivery_fee: Number(form.delivery_fee || 0),
      default_language: form.default_language,
      payment_method: form.payment_method,
      facebook: form.facebook,
      instagram: form.instagram,
      tiktok: form.tiktok,
      youtube: form.youtube,
      buy2_offer_enabled: form.buy2_offer_enabled,
      buy2_offer_starts_at: form.buy2_offer_starts_at || '',
      buy2_offer_ends_at: form.buy2_offer_ends_at || '',
      buy2_discount_type: form.buy2_discount_type,
      buy2_discount_value: Number(form.buy2_discount_value || 0),
      loyalty_points_enabled: form.loyalty_points_enabled,
      loyalty_amount_per_point: Number(form.loyalty_amount_per_point || 10),
      loyalty_reward_points: Number(form.loyalty_reward_points || 100),
      loyalty_reward_value: Number(form.loyalty_reward_value || 0),
    };

    try {
      await updateSettings(payload);
      await updateSocialLinks({
        whatsapp: whatsappLink,
        facebook: form.facebook,
        instagram: form.instagram,
        tiktok: form.tiktok,
        youtube: form.youtube,
      });
      await refreshStoreData();
      showToast(ta('common.successSaved'));
    } catch {
      setError(ta('errors.saveSettings'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="admin-page admin-page--narrow">
      <AdminPageHeader title={ta('settings.title')} subtitle={ta('settings.subtitle')} />

      <AdminErrorState message={error} />

      {isLoading ? (
        <AdminLoadingState message={ta('common.loading')} />
      ) : (
        <form className="admin-settings-form" onSubmit={handleSubmit}>
          <AdminCard title={ta('settings.storeDetails')}>
            <div className="admin-form admin-form--grid">
              <div className="admin-settings-locked-row admin-form__wide">
                <label>
                  <span>{ta('settings.storeName')}</span>
                  <input name="store_name" value={form.store_name} readOnly />
                </label>
                <label>
                  <span>{ta('settings.currency')}</span>
                  <input name="currency" value={getCurrencyLabel(language, form.currency)} readOnly />
                </label>
                <label>
                  <span>{ta('settings.country')}</span>
                  <input name="country" value={form.country} readOnly />
                </label>
              </div>
              <label>
                <span>
                  {ta('settings.whatsappNumber')} <em>{ta('common.required')}</em>
                </span>
                <input name="whatsapp_number" value={form.whatsapp_number} onChange={updateField} dir="ltr" />
              </label>
              <label>
                <span>{ta('settings.deliveryFee')}</span>
                <input type="number" min="0" step="0.01" name="delivery_fee" value={form.delivery_fee} onChange={updateField} />
              </label>
              <label>
                <span>{ta('settings.defaultLanguage')}</span>
                <AdminSelect
                  ariaLabel={ta('settings.defaultLanguage')}
                  value={form.default_language}
                  options={languageOptions}
                  onChange={(value) => setForm((current) => ({ ...current, default_language: value }))}
                />
              </label>
            </div>
          </AdminCard>

          <AdminCard title={ta('settings.buy2Offer')}>
            <div className="admin-settings-feature">
              <label className="admin-check-row">
                <input
                  type="checkbox"
                  name="buy2_offer_enabled"
                  checked={form.buy2_offer_enabled}
                  onChange={updateField}
                />
                <span>{ta('settings.enableBuy2Offer')}</span>
              </label>
              <div className="admin-form admin-form--grid">
                <label>
                  <span>{ta('settings.offerStartsAt')}</span>
                  <input type="datetime-local" name="buy2_offer_starts_at" value={form.buy2_offer_starts_at} onChange={updateField} dir="ltr" />
                </label>
                <label>
                  <span>{ta('settings.offerEndsAt')}</span>
                  <input type="datetime-local" name="buy2_offer_ends_at" value={form.buy2_offer_ends_at} onChange={updateField} dir="ltr" />
                </label>
                <label>
                  <span>{ta('settings.discountType')}</span>
                  <AdminSelect
                    ariaLabel={ta('settings.discountType')}
                    value={form.buy2_discount_type}
                    options={discountTypeOptions}
                    onChange={(value) => setForm((current) => ({ ...current, buy2_discount_type: value }))}
                  />
                </label>
                <label>
                  <span>{ta('settings.discountValue')}</span>
                  <input type="number" min="0" step="0.01" name="buy2_discount_value" value={form.buy2_discount_value} onChange={updateField} />
                </label>
              </div>
              <p className="admin-helper-text">{ta('settings.buy2OfferHint')}</p>
            </div>
          </AdminCard>

          <AdminCard title={ta('settings.loyaltyProgram')}>
            <div className="admin-settings-feature">
              <label className="admin-check-row">
                <input
                  type="checkbox"
                  name="loyalty_points_enabled"
                  checked={form.loyalty_points_enabled}
                  onChange={updateField}
                />
                <span>{ta('settings.enableLoyalty')}</span>
              </label>
              <div className="admin-form admin-form--grid">
                <label>
                  <span>{ta('settings.amountPerPoint')}</span>
                  <input type="number" min="1" step="0.01" name="loyalty_amount_per_point" value={form.loyalty_amount_per_point} onChange={updateField} />
                </label>
                <label>
                  <span>{ta('settings.rewardPoints')}</span>
                  <input type="number" min="1" step="1" name="loyalty_reward_points" value={form.loyalty_reward_points} onChange={updateField} />
                </label>
                <label>
                  <span>{ta('settings.rewardValue')}</span>
                  <input type="number" min="0" step="0.01" name="loyalty_reward_value" value={form.loyalty_reward_value} onChange={updateField} />
                </label>
              </div>
              <p className="admin-helper-text">{ta('settings.loyaltyHint')}</p>
            </div>
          </AdminCard>

          <AdminCard title={ta('settings.socialLinks')}>
            <div className="admin-form admin-form--grid">
              <label>
                <span>{ta('settings.whatsappLink')}</span>
                <input name="whatsapp" value={form.whatsapp} readOnly dir="ltr" placeholder="https://wa.me/212600000000" />
              </label>
              <label>
                <span>Instagram</span>
                <input name="instagram" value={form.instagram} onChange={updateField} dir="ltr" />
              </label>
              <label>
                <span>Facebook</span>
                <input name="facebook" value={form.facebook} onChange={updateField} dir="ltr" />
              </label>
              <label>
                <span>TikTok</span>
                <input name="tiktok" value={form.tiktok} onChange={updateField} dir="ltr" />
              </label>
              <label>
                <span>YouTube</span>
                <input name="youtube" value={form.youtube} onChange={updateField} dir="ltr" />
              </label>
            </div>
          </AdminCard>

          <div className="admin-form-actions admin-form-actions--sticky">
            <button className="admin-button admin-button--primary" type="submit" disabled={isSaving}>
              <Save size={16} />
              <span>{isSaving ? ta('common.loading') : ta('common.save')}</span>
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
