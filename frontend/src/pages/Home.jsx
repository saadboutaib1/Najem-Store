import { Banknote, MessageCircle, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import CategoryCard from '../components/common/CategoryCard.jsx';
import { STORE_CONFIG } from '../config/store.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getCategories } from '../services/catalogService.js';

export default function Home() {
  const { t } = useLanguage();
  const categories = getCategories();
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber.replace(/[^\d]/g, '')}`;
  const whyItems = [
    {
      icon: Sparkles,
      title: t('home.whyItems.quality'),
      text: t('home.whyItems.qualityText'),
    },
    {
      icon: Truck,
      title: t('home.whyItems.delivery'),
      text: t('home.whyItems.deliveryText'),
    },
    {
      icon: ShieldCheck,
      title: t('home.whyItems.trust'),
      text: t('home.whyItems.trustText'),
    },
  ];

  return (
    <>
      <section className="hero">
        <div className="container hero__content">
          <span className="eyebrow">{t('home.eyebrow')}</span>
          <h1>{t('home.title')}</h1>
          <p>{t('home.description')}</p>
          <div className="hero__actions">
            <Link to="/products" className="button button--gold">
              <Banknote size={19} aria-hidden="true" />
              {t('common.shopNow')}
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="button button--outline">
              <MessageCircle size={19} aria-hidden="true" />
              {t('common.whatsapp')}
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container section-heading">
          <span className="eyebrow">{t('nav.categories')}</span>
          <h2>{t('home.categoriesTitle')}</h2>
          <p>{t('home.categoriesSubtitle')}</p>
        </div>
        <div className="container category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container why-section">
          <div className="why-grid why-grid--centered">
            {whyItems.map(({ icon: Icon, title, text }) => (
              <article className="why-item" key={title}>
                <Icon size={24} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
