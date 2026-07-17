import { Clock3, CreditCard, Gift, LockKeyhole, MessageCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

const sectionIcons = [LockKeyhole, MessageCircle, Gift, Clock3, UserCheck, ShieldCheck, MessageCircle, CreditCard];

export default function PrivacyPolicy() {
  const { t } = useLanguage();
  const sections = t('privacy.sections', []);
  const highlights = t('privacy.highlights', []);

  return (
    <section className="privacy-page">
      <div className="container privacy-shell">
        <div className="privacy-hero">
          <span className="eyebrow">{t('privacy.eyebrow')}</span>
          <h1>{t('privacy.title')}</h1>
          <p>{t('privacy.subtitle')}</p>
          <span className="privacy-updated">{t('privacy.updatedAt')}</span>
        </div>

        <div className="privacy-highlights" aria-label={t('privacy.highlightsLabel')}>
          {highlights.map((item) => (
            <article className="privacy-highlight" key={item.title}>
              <ShieldCheck size={22} aria-hidden="true" />
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="privacy-sections">
          {sections.map((section, index) => {
            const Icon = sectionIcons[index] || ShieldCheck;

            return (
              <article className="privacy-card" key={section.title}>
                <div className="privacy-card__icon">
                  <Icon size={23} aria-hidden="true" />
                </div>
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.text}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="privacy-cta">
          <div>
            <h2>{t('privacy.ctaTitle')}</h2>
            <p>{t('privacy.ctaText')}</p>
          </div>
          <Link to="/contact" className="button button--gold">
            <MessageCircle size={18} aria-hidden="true" />
            {t('privacy.ctaButton')}
          </Link>
        </div>
      </div>
    </section>
  );
}
