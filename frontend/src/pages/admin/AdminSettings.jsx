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
};

function linksToMap(links = []) {
  return links.reduce((map, link) => ({ ...map, [link.platform]: link.url }), {});
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
    { value: 'en', label: ta('settings.english') },
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
          setForm({
            ...emptySettingsForm,
            ...settings,
            facebook: settings.facebook || linkMap.facebook || '',
            instagram: settings.instagram || linkMap.instagram || '',
            tiktok: settings.tiktok || linkMap.tiktok || '',
            youtube: settings.youtube || linkMap.youtube || '',
            whatsapp: linkMap.whatsapp || '',
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
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.store_name.trim() || !form.whatsapp_number.trim() || !form.currency.trim() || !form.country.trim()) {
      setError(ta('common.validationRequired'));
      return;
    }

    if (Number(form.delivery_fee || 0) < 0) {
      setError(ta('common.validationNonNegative'));
      return;
    }

    setIsSaving(true);

    const payload = {
      store_name: form.store_name,
      whatsapp_number: form.whatsapp_number,
      currency: form.currency,
      delivery_fee: Number(form.delivery_fee || 0),
      default_language: form.default_language,
      payment_method: form.payment_method,
      country: form.country,
      facebook: form.facebook,
      instagram: form.instagram,
      tiktok: form.tiktok,
      youtube: form.youtube,
    };

    try {
      await updateSettings(payload);
      await updateSocialLinks({
        whatsapp: form.whatsapp,
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
              <label>
                <span>
                  {ta('settings.storeName')} <em>{ta('common.required')}</em>
                </span>
                <input name="store_name" value={form.store_name} onChange={updateField} />
              </label>
              <label>
                <span>
                  {ta('settings.whatsappNumber')} <em>{ta('common.required')}</em>
                </span>
                <input name="whatsapp_number" value={form.whatsapp_number} onChange={updateField} dir="ltr" />
              </label>
              <label>
                <span>
                  {ta('settings.currency')} <em>{ta('common.required')}</em>
                </span>
                <input name="currency" value={form.currency} onChange={updateField} />
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
              <label>
                <span>
                  {ta('settings.country')} <em>{ta('common.required')}</em>
                </span>
                <input name="country" value={form.country} onChange={updateField} />
              </label>
            </div>
          </AdminCard>

          <AdminCard title={ta('settings.socialLinks')}>
            <div className="admin-form admin-form--grid">
              <label>
                <span>{ta('settings.whatsappLink')}</span>
                <input name="whatsapp" value={form.whatsapp} onChange={updateField} dir="ltr" placeholder="https://wa.me/212600000000" />
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
