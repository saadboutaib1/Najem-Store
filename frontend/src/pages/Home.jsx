import { Banknote, MessageCircle, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryCard from '../components/common/CategoryCard.jsx';
import ProductCard from '../components/common/ProductCard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStoreData } from '../context/StoreDataContext.jsx';
import {
  getCategories as getFallbackCategories,
  getFeaturedProducts as getFallbackFeaturedProducts,
} from '../services/catalogService.js';
import {
  getCategories as getApiCategories,
  getFeaturedProducts as getApiFeaturedProducts,
} from '../services/api.js';
import { adaptCategories, adaptProducts } from '../utils/adapters.js';

export default function Home() {
  const { language, t } = useLanguage();
  const { getWhatsAppUrl } = useStoreData();
  const [categories, setCategories] = useState(getFallbackCategories);
  const [featuredProducts, setFeaturedProducts] = useState(getFallbackFeaturedProducts);
  const [catalogStatus, setCatalogStatus] = useState({ isLoading: true, error: '' });
  const whatsappUrl = getWhatsAppUrl();
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
  const loadingText = t('common.loadingCategories');
  const loadingFeaturedText = t('common.loadingFeaturedProducts');
  const offlineText = t('common.catalogOffline');

  useEffect(() => {
    let isMounted = true;

    async function loadHomeCatalog() {
      setCatalogStatus({ isLoading: true, error: '' });

      const [categoriesResult, featuredResult] = await Promise.allSettled([
        getApiCategories(),
        getApiFeaturedProducts(),
      ]);

      if (!isMounted) return;

      if (categoriesResult.status === 'fulfilled') {
        setCategories(adaptCategories(categoriesResult.value));
      } else {
        setCategories(getFallbackCategories());
      }

      if (featuredResult.status === 'fulfilled') {
        setFeaturedProducts(adaptProducts(featuredResult.value));
      } else {
        setFeaturedProducts(getFallbackFeaturedProducts());
      }

      setCatalogStatus({
        isLoading: false,
        error:
          categoriesResult.status === 'rejected' || featuredResult.status === 'rejected'
            ? offlineText
            : '',
      });
    }

    loadHomeCatalog();

    return () => {
      isMounted = false;
    };
  }, [offlineText]);

  return (
    <>
      <section className="hero hero--titleless">
        <video
          className="hero__video"
          src="/brand/hero-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div className="container hero__content">
          <h1 className="sr-only">{t('common.storeName')}</h1>
          <span className="eyebrow">{t('home.eyebrow')}</span>
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
          <h2>{t('home.categoriesTitle')}</h2>
        </div>
        {catalogStatus.isLoading && <div className="catalog-loading" role="status" aria-label={loadingText} />}
        {!catalogStatus.isLoading && catalogStatus.error && <p className="catalog-notice">{catalogStatus.error}</p>}
        <div className="container category-grid" aria-busy={catalogStatus.isLoading}>
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {(catalogStatus.isLoading || featuredProducts.length > 0) && (
        <section className="section home-featured-section">
          <div className="container section-heading">
            <h2>{t('home.featuredTitle')}</h2>
          </div>
          {catalogStatus.isLoading && <div className="catalog-loading" role="status" aria-label={loadingFeaturedText} />}
          <div className="container product-grid home-featured-grid" aria-busy={catalogStatus.isLoading}>
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {!catalogStatus.isLoading && featuredProducts.length > 0 && (
            <div className="container page-actions home-featured-actions">
              <Link to="/products" className="button button--gold">
                {t('home.viewAllProducts')}
              </Link>
            </div>
          )}
        </section>
      )}

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
