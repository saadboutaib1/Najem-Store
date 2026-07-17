import { CreditCard, MapPin, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStoreData } from '../context/StoreDataContext.jsx';
import { isValidPhoneNumber } from '../utils/validation.js';

const infoIcons = [MessageCircle, CreditCard, MapPin];

function YouTubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="6.5" width="18" height="11" rx="3.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M10.5 9.6L15.2 12L10.5 14.4V9.6Z" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M14 4V15.1C14 17.8 12.1 20 9.4 20C7 20 5 18.3 5 15.9C5 13.5 6.9 11.8 9.2 11.8C9.7 11.8 10.1 11.9 10.5 12.1V8.7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path d="M14 4C14.5 7 16.6 8.7 19 8.9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="5" y="5" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="16.2" cy="7.8" r="1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M14.2 8.4H16V5.3C15.2 5.2 14.6 5.1 13.7 5.1C11.5 5.1 10 6.5 10 9V11H7.8V14.4H10V20H13.5V14.4H15.8L16.2 11H13.5V9.3C13.5 8.7 13.8 8.4 14.2 8.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5.4 19L6.3 15.8C5.7 14.7 5.4 13.5 5.4 12.2C5.4 8.1 8.7 4.8 12.8 4.8C16.8 4.8 20.1 8.1 20.1 12.2C20.1 16.2 16.8 19.5 12.8 19.5C11.5 19.5 10.3 19.2 9.3 18.6L5.4 19Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.7 9.4C9.9 8.9 10.2 8.9 10.5 8.9H11C11.2 8.9 11.4 9 11.5 9.3L12 10.5C12.1 10.8 12 11 11.8 11.2L11.4 11.6C11.9 12.6 12.7 13.3 13.8 13.8L14.3 13.3C14.5 13.1 14.7 13.1 15 13.2L16.2 13.8C16.5 14 16.6 14.1 16.6 14.4V14.8C16.6 15.2 16.4 15.6 15.9 15.8C13.2 16.7 8.8 12.5 9.7 9.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Contact() {
  const { t } = useLanguage();
  const { getWhatsAppUrl, socialLinks: storeSocialLinks } = useStoreData();
  const [formData, setFormData] = useState({ fullName: '', phone: '', message: '' });
  const [error, setError] = useState('');
  const socialLinks = [
    { label: 'WhatsApp', href: storeSocialLinks.whatsapp, icon: WhatsAppIcon },
    { label: 'Instagram', href: storeSocialLinks.instagram, icon: InstagramIcon },
    { label: 'Facebook', href: storeSocialLinks.facebook, icon: FacebookIcon },
    { label: 'TikTok', href: storeSocialLinks.tiktok, icon: TikTokIcon },
    { label: 'YouTube', href: storeSocialLinks.youtube, icon: YouTubeIcon },
  ];

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const fullName = formData.fullName.trim();
    const phone = formData.phone.trim();
    const message = formData.message.trim();

    if (!fullName || !phone || !message) {
      setError(t('contact.validation'));
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      setError(t('contact.invalidPhone'));
      return;
    }

    const whatsappMessage = [
      t('contact.whatsappMessageTitle'),
      `${t('contact.form.fullName')}: ${fullName}`,
      `${t('contact.form.phone')}: ${phone}`,
      `${t('contact.form.message')}: ${message}`,
    ].join('\n');

    window.open(getWhatsAppUrl(whatsappMessage), '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="page-section contact-compact-page">
      <div className="container contact-compact-stack">
        <div className="contact-compact-hero">
          <div className="contact-compact-copy">
            <span className="eyebrow">MAGHRIB OUD</span>
            <h1>{t('contact.title')}</h1>
            <p>{t('contact.subtitle')}</p>
          </div>
        </div>

        <div className="contact-info-grid">
          {t('contact.infoCards', []).map((card, index) => {
            const Icon = infoIcons[index] || MessageCircle;

            return (
              <article className="contact-info-card" key={card.title}>
                <Icon size={24} aria-hidden="true" />
                <h2>{card.title}</h2>
                <p>{card.text}</p>
              </article>
            );
          })}
        </div>

        <form className="contact-whatsapp-form" onSubmit={handleSubmit} noValidate>
          <h2>{t('contact.formTitle')}</h2>
          <label>
            {t('contact.form.fullName')}
            <input
              value={formData.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              type="text"
              autoComplete="name"
              dir="auto"
              required
            />
          </label>
          <label>
            {t('contact.form.phone')}
            <input
              value={formData.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              dir="ltr"
              required
            />
          </label>
          <label>
            {t('contact.form.message')}
            <textarea
              value={formData.message}
              onChange={(event) => updateField('message', event.target.value)}
              rows="4"
              dir="auto"
              required
            />
          </label>
          {error && <p className="form-error" aria-live="polite">{error}</p>}
          <button className="button button--gold" type="submit">
            <Send size={18} aria-hidden="true" />
            {t('contact.form.send')}
          </button>
        </form>

        <div className="contact-social-card" aria-label={t('contact.socialTitle')}>
          <div className="contact-social-list">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a className="contact-social-button" href={href} key={label} rel="noreferrer" target="_blank">
                <Icon className="contact-social-button__icon" />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
