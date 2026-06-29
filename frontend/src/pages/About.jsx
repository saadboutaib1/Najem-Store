import { Gem, MessageCircle, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

const valueIcons = [Gem, ShieldCheck, MessageCircle];

export default function About() {
  const { t } = useLanguage();
  const values = t('about.values', []);

  return (
    <section className="page-section about-compact-page">
      <div className="container about-compact-stack">
        <div className="about-compact-copy">
          <span className="eyebrow">NAJEM STORE</span>
          <h1>{t('about.title')}</h1>
          <p>{t('about.intro')}</p>
        </div>

        <div className="about-compact-mission">
          <h2>{t('about.missionTitle')}</h2>
          <p>{t('about.mission')}</p>
        </div>

        <div className="about-compact-values">
          {values.map((value, index) => {
            const Icon = valueIcons[index] || Gem;

            return (
              <article className="about-compact-card" key={value.title}>
                <Icon size={24} aria-hidden="true" />
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            );
          })}
        </div>

        <div className="about-compact-cta">
          <p>{t('about.ctaText')}</p>
          <Link className="button button--gold" to="/products">
            <ShoppingBag size={18} aria-hidden="true" />
            {t('about.ctaButton')}
          </Link>
        </div>
      </div>
    </section>
  );
}
