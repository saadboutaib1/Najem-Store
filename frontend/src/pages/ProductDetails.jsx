import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../components/common/BackButton.jsx';
import QuantityStepper from '../components/common/QuantityStepper.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStoreData } from '../context/StoreDataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatCurrency, formatStock, getLocalizedField } from '../utils/formatters.js';
import {
  getCategoryBySlug,
  getProductById,
} from '../services/catalogService.js';
import { ApiError, getProduct as getApiProduct } from '../services/api.js';
import { adaptProduct, getProductImageFallback } from '../utils/adapters.js';
import NotFound from './NotFound.jsx';

export default function ProductDetails() {
  const { productId } = useParams();
  const [product, setProduct] = useState(() => getProductById(productId));
  const [productStatus, setProductStatus] = useState({ isLoading: true, error: '' });
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const { settings } = useStoreData();
  const loadingText = language === 'ar' ? 'جارٍ تحميل المنتج...' : 'Loading product...';
  const offlineText =
    language === 'ar'
      ? 'تعذر الاتصال بالخادم حاليًا، يتم عرض بيانات محلية مؤقتة.'
      : 'Backend is offline right now, local demo data is shown.';

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setProductStatus({ isLoading: true, error: '' });

      try {
        const apiProduct = await getApiProduct(productId);
        if (!isMounted) return;
        setProduct(adaptProduct(apiProduct));
        setProductStatus({ isLoading: false, error: '' });
      } catch (error) {
        if (!isMounted) return;
        if (error instanceof ApiError && error.status > 0) {
          setProduct(null);
          setProductStatus({ isLoading: false, error: '' });
          return;
        }

        const fallbackProduct = getProductById(productId);
        setProduct(fallbackProduct);
        setProductStatus({
          isLoading: false,
          error: fallbackProduct ? offlineText : '',
        });
      }
    }

    loadProduct();
    setQuantity(1);

    return () => {
      isMounted = false;
    };
  }, [offlineText, productId]);

  if (productStatus.isLoading && !product) {
    return (
      <section className="page-section product-detail-page">
        <div className="container empty-panel">
          <ShoppingBag size={44} aria-hidden="true" />
          <h1>{loadingText}</h1>
        </div>
      </section>
    );
  }

  if (!product) {
    return <NotFound />;
  }

  const category = getCategoryBySlug(product.category);
  const productName = getLocalizedField(product, 'name', language);
  const stockText = formatStock(product.stock, language);
  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(t('common.addedToCart'));
  };
  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = getProductImageFallback(product.category);
  };

  return (
    <section className="page-section product-detail-page">
      <div className="container product-detail-page__container">
        <BackButton fallbackTo="/products" label={t('common.backToProducts')} />

        <div className="product-detail">
          <div className="product-detail__media">
            <img src={product.image} alt={productName} onError={handleImageError} />
          </div>
          <div className="product-detail__content">
            <span className="eyebrow">
              {category ? getLocalizedField(category, 'name', language) : 'Najem Store'}
            </span>
            <h1>{productName}</h1>
            <span className={`stock ${product.stock > 0 ? 'stock--in' : 'stock--out'}`}>
              {stockText}
            </span>
            {productStatus.error && <p className="form-error">{productStatus.error}</p>}
            <p>{getLocalizedField(product, 'description', language)}</p>
            <div className="price-row">
              <strong>{formatCurrency(product.price, language, settings.currency)}</strong>
              {product.oldPrice && (
                <span className="old-price">{formatCurrency(product.oldPrice, language, settings.currency)}</span>
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
