import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStoreData } from '../../context/StoreDataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getCategoryBySlug } from '../../services/catalogService.js';
import { getProductImageFallback } from '../../utils/adapters.js';
import { formatCurrency, formatStock, getLocalizedField } from '../../utils/formatters.js';
import { isBuy2OfferActive } from '../../utils/promotions.js';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const { settings } = useStoreData();
  const hasBuy2Offer = isBuy2OfferActive(settings.buy2Offer);
  const productName = getLocalizedField(product, 'name', language);
  const isAvailable = product.stock > 0;
  const stockText = formatStock(product.stock, language);
  const category = getCategoryBySlug(product.category);
  const categoryLabel =
    product[`category_name_${language}`] ||
    product.category_name_en ||
    product.category_name_fr ||
    product.category_name_ar ||
    (category ? getLocalizedField(category, 'name', language) : '');
  const productPath = `/products/${encodeURIComponent(product.slug || product.id)}`;
  const buy2OfferLabel = t('common.buy2OfferBadge');

  const handleAddToCart = () => {
    addToCart(product);
    showToast(t('common.addedToCart'));
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = getProductImageFallback(product.category, product.slug);
  };

  return (
    <article className="product-card">
      <Link to={productPath} className="product-card__image-link">
        <img src={product.image} alt={productName} className="product-card__image" onError={handleImageError} />
      </Link>
      <div className="product-card__body">
        <div className="product-card__meta">
          {categoryLabel && (
            <span className="product-card__category">
              {categoryLabel}
            </span>
          )}
          {hasBuy2Offer && (
            <span className="product-card__offer">
              {buy2OfferLabel}
            </span>
          )}
        </div>
        <h3>
          <Link to={productPath}>{productName}</Link>
        </h3>
        <p>{getLocalizedField(product, 'description', language)}</p>
        <div className="product-card__footer">
          <div className="product-card__price">
            <strong>{formatCurrency(product.price, language, settings.currency)}</strong>
            <span className={product.oldPrice ? 'old-price' : 'old-price old-price--placeholder'}>
              {product.oldPrice
                ? formatCurrency(product.oldPrice, language, settings.currency)
                : formatCurrency(product.price, language, settings.currency)}
            </span>
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
