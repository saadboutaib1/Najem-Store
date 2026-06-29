import CategoryCard from '../components/common/CategoryCard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getCategories } from '../services/catalogService.js';

export default function Categories() {
  const { t } = useLanguage();
  const categories = getCategories();

  return (
    <section className="page-section">
      <div className="container section-heading">
        <span className="eyebrow">Najem Store</span>
        <h1>{t('categories.title')}</h1>
        <p>{t('categories.subtitle')}</p>
      </div>
      <div className="container category-grid">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
