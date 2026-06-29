import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getLocalizedField } from '../../utils/formatters.js';

export default function CategoryCard({ category }) {
  const { language, direction, t } = useLanguage();
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <Link className="category-card" to={`/products?category=${category.slug}`}>
      <img src={category.image} alt={getLocalizedField(category, 'name', language)} />
      <span className="category-card__label">{getLocalizedField(category, 'name', language)}</span>
      <p>{getLocalizedField(category, 'description', language)}</p>
      <span className="text-link">
        {t('categories.browse')}
        <ArrowIcon size={17} aria-hidden="true" />
      </span>
    </Link>
  );
}
