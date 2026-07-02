import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStoreData } from '../../context/StoreDataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getCategoryBySlug } from '../../services/catalogService.js';
import { getProductImageFallback } from '../../utils/adapters.js';
import { formatCurrency, formatStock, getLocalizedField } from '../../utils/formatters.js';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const { settings } = useStoreData();
  const productName = getLocalizedField(product, 'name', language);
  const isAvailable = product.stock > 0;
  const stockText = formatStock(product.stock, language);
  const category = getCategoryBySlug(product.category);
  const categoryLabel =
    product[`category_name_${language}`] ||
    product.category_name_ar ||
    product.category_name_en ||
    (category ? getLocalizedField(category, 'name', language) : '');

  const handleAddToCart = () => {
    addToCart(product);
    showToast(t('common.addedToCart'));
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = getProductImageFallback(product.category);
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__image-link">
        <img src={product.image} alt={productName} className="product-card__image" onError={handleImageError} />
      </Link>
      <div className="product-card__body">
        <div className="product-card__meta">
          {categoryLabel && (
            <span className="product-card__category">
              {categoryLabel}
            </span>
          )}
        </div>
        <h3>
          <Link to={`/products/${product.id}`}>{productName}</Link>
        </h3>
        <p>{getLocalizedField(product, 'description', language)}</p>
        <div className="product-card__footer">
          <div>
            <strong>{formatCurrency(product.price, language, settings.currency)}</strong>
            {product.oldPrice && (
              <span className="old-price">{formatCurrency(product.oldPrice, language, settings.currency)}</span>
            )}
          </div>
          <span className={`stock ${isAvailable ? 'stock--in' : 'stock--out'}`}>
            {stockText}
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
