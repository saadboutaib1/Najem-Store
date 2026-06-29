import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getCategoryBySlug } from '../../services/catalogService.js';
import { formatCurrency, getLocalizedField } from '../../utils/formatters.js';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const productName = getLocalizedField(product, 'name', language);
  const isAvailable = product.stock > 0;
  const category = getCategoryBySlug(product.category);

  const handleAddToCart = () => {
    addToCart(product);
    showToast(t('common.addedToCart'));
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__image-link">
        <img src={product.image} alt={productName} className="product-card__image" />
      </Link>
      <div className="product-card__body">
        <div className="product-card__meta">
          {category && (
            <span className="product-card__category">
              {getLocalizedField(category, 'name', language)}
            </span>
          )}
        </div>
        <h3>
          <Link to={`/products/${product.id}`}>{productName}</Link>
        </h3>
        <p>{getLocalizedField(product, 'description', language)}</p>
        <div className="product-card__footer">
          <div>
            <strong>{formatCurrency(product.price, language)}</strong>
            {product.oldPrice && (
              <span className="old-price">{formatCurrency(product.oldPrice, language)}</span>
            )}
          </div>
          <span className={`stock ${isAvailable ? 'stock--in' : 'stock--out'}`}>
            {isAvailable ? t('common.inStock') : t('common.outOfStock')}
          </span>
        </div>
        <button
          type="button"
          className="button button--gold button--full"
          onClick={handleAddToCart}
          disabled={!isAvailable}
        >
          <ShoppingBag size={18} aria-hidden="true" />
          {t('common.addToCart')}
        </button>
      </div>
    </article>
  );
}
