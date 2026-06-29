import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../components/common/BackButton.jsx';
import QuantityStepper from '../components/common/QuantityStepper.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatCurrency, getLocalizedField } from '../utils/formatters.js';
import {
  getCategoryBySlug,
  getProductById,
} from '../services/catalogService.js';
import NotFound from './NotFound.jsx';

export default function ProductDetails() {
  const { productId } = useParams();
  const product = getProductById(productId);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { language, t } = useLanguage();

  if (!product) {
    return <NotFound />;
  }

  const category = getCategoryBySlug(product.category);
  const productName = getLocalizedField(product, 'name', language);
  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(t('common.addedToCart'));
  };

  return (
    <section className="page-section product-detail-page">
      <div className="container product-detail-page__container">
        <BackButton fallbackTo="/products" label={t('common.backToProducts')} />

        <div className="product-detail">
          <div className="product-detail__media">
            <img src={product.image} alt={productName} />
          </div>
          <div className="product-detail__content">
            <span className="eyebrow">
              {category ? getLocalizedField(category, 'name', language) : 'Najem Store'}
            </span>
            <h1>{productName}</h1>
            <span className={`stock ${product.stock > 0 ? 'stock--in' : 'stock--out'}`}>
              {product.stock > 0 ? t('common.inStock') : t('common.outOfStock')}
            </span>
            <p>{getLocalizedField(product, 'description', language)}</p>
            <div className="price-row">
              <strong>{formatCurrency(product.price, language)}</strong>
              {product.oldPrice && (
                <span className="old-price">{formatCurrency(product.oldPrice, language)}</span>
              )}
            </div>
            <div className="detail-actions">
              <QuantityStepper
                value={quantity}
                max={product.stock}
                label={t('common.quantity')}
                increaseLabel={t('common.increaseQuantity')}
                decreaseLabel={t('common.decreaseQuantity')}
                onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
                onIncrease={() => setQuantity((current) => Math.min(product.stock, current + 1))}
              />
              <button
                type="button"
                className="button button--gold"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingBag size={19} aria-hidden="true" />
                {t('common.addToCart')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
