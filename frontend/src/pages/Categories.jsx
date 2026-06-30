import { useEffect, useState } from 'react';
import CategoryCard from '../components/common/CategoryCard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getCategories as getFallbackCategories } from '../services/catalogService.js';
import { getCategories as getApiCategories } from '../services/api.js';
import { adaptCategories } from '../utils/adapters.js';

export default function Categories() {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState(getFallbackCategories);
  const [catalogStatus, setCatalogStatus] = useState({ isLoading: true, error: '' });
  const loadingText = language === 'ar' ? 'جاري تحميل الأقسام...' : 'Loading categories...';
  const offlineText =
    language === 'ar'
      ? 'تعذر الاتصال بالخادم حاليا، يتم عرض بيانات محلية مؤقتة.'
      : 'Backend is offline right now, local demo data is shown.';

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      setCatalogStatus({ isLoading: true, error: '' });

      try {
        const apiCategories = await getApiCategories();
        if (!isMounted) return;
        setCategories(adaptCategories(apiCategories));
        setCatalogStatus({ isLoading: false, error: '' });
      } catch {
        if (!isMounted) return;
        setCategories(getFallbackCategories());
        setCatalogStatus({ isLoading: false, error: offlineText });
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [offlineText]);

  return (
    <section className="page-section">
      <div className="container section-heading">
        <span className="eyebrow">Najem Store</span>
        <h1>{t('categories.title')}</h1>
        <p>{t('categories.subtitle')}</p>
      </div>
      {catalogStatus.isLoading && <div className="catalog-loading" role="status" aria-label={loadingText} />}
      {!catalogStatus.isLoading && catalogStatus.error && <p className="catalog-notice">{catalogStatus.error}</p>}
      <div className="container category-grid" aria-busy={catalogStatus.isLoading}>
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
