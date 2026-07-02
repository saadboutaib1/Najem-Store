import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getCategoryImageFallback } from '../../utils/adapters.js';
import { getLocalizedField } from '../../utils/formatters.js';

export default function CategoryCard({ category }) {
  const { language, direction, t } = useLanguage();
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const categoryName = getLocalizedField(category, 'name', language);
  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = getCategoryImageFallback(category.slug);
  };

  return (
    <Link className="category-card" to={`/products?category=${category.slug}`}>
      <img src={category.image} alt={categoryName} onError={handleImageError} />
      <span className="category-card__label">{categoryName}</span>
      <p>{getLocalizedField(category, 'description', language)}</p>
      <span className="text-link">
        {t('categories.browse')}
        <ArrowIcon size={17} aria-hidden="true" />
      </span>
    </Link>
  );
}
