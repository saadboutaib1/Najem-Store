import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getLocalizedField } from '../utils/formatters.js';
import {
  filterProductList,
  getCategories as getFallbackCategories,
  getProducts as getFallbackProducts,
} from '../services/catalogService.js';
import {
  getCategories as getApiCategories,
  getProducts as getApiProducts,
} from '../services/api.js';
import { adaptCategories, adaptProducts } from '../utils/adapters.js';

const PRODUCTS_PER_PAGE = 8;

export default function Products() {
  const { language, direction, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState(getFallbackCategories);
  const [products, setProducts] = useState(getFallbackProducts);
  const [catalogStatus, setCatalogStatus] = useState({ isLoading: true, error: '' });
  const selectedCategory = searchParams.get('category') || 'all';
  const activeCategory =
    selectedCategory === 'all'
      ? null
      : categories.find((category) => category.slug === selectedCategory);
  const PreviousIcon = direction === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = direction === 'rtl' ? ChevronLeft : ChevronRight;
  const loadingText = language === 'ar' ? 'جاري تحميل المنتجات...' : 'Loading products...';
  const offlineText =
    language === 'ar'
      ? 'تعذر الاتصال بالخادم حاليا، يتم عرض بيانات محلية مؤقتة.'
      : 'Backend is offline right now, local demo data is shown.';

  const filteredProducts = useMemo(() => {
    return filterProductList(products, { category: selectedCategory, searchTerm, language });
  }, [language, products, searchTerm, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (activePage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [activePage, filteredProducts]);
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(activePage - 2, totalPages - 4));
    return Array.from({ length: 5 }, (_, index) => start + index);
  }, [activePage, totalPages]);
  const pageStatus = t('products.pageStatus')
    .replace('{current}', activePage)
    .replace('{total}', totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [language, searchTerm, selectedCategory]);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      setCatalogStatus({ isLoading: true, error: '' });

      const [categoriesResult, productsResult] = await Promise.allSettled([
        getApiCategories(),
        getApiProducts(),
      ]);

      if (!isMounted) return;

      if (categoriesResult.status === 'fulfilled') {
        setCategories(adaptCategories(categoriesResult.value));
      } else {
        setCategories(getFallbackCategories());
      }

      if (productsResult.status === 'fulfilled') {
        setProducts(adaptProducts(productsResult.value));
      } else {
        setProducts(getFallbackProducts());
      }

      setCatalogStatus({
        isLoading: false,
        error:
          categoriesResult.status === 'rejected' || productsResult.status === 'rejected'
            ? offlineText
            : '',
      });
    }

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, [offlineText]);

  const updateCategory = (category) => {
    if (category === 'all') {
      setSearchParams({});
      return;
    }

    setSearchParams({ category });
  };

  return (
    <section className="page-section">
      <div className="container section-heading">
        <span className="eyebrow">Najem Store</span>
        <h1>
          {activeCategory ? getLocalizedField(activeCategory, 'name', language) : t('products.title')}
        </h1>
        {activeCategory && <p>{getLocalizedField(activeCategory, 'description', language)}</p>}
      </div>

      <div className="container product-toolbar">
        <div className="search-box">
          <Search size={19} aria-hidden="true" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('products.searchPlaceholder')}
            type="search"
          />
        </div>
        <div className="filter-pills" aria-label={t('nav.categories')}>
          <button
            type="button"
            className={selectedCategory === 'all' ? 'pill pill--active' : 'pill'}
            onClick={() => updateCategory('all')}
          >
            {t('common.all')}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={selectedCategory === category.slug ? 'pill pill--active' : 'pill'}
              onClick={() => updateCategory(category.slug)}
            >
              {getLocalizedField(category, 'name', language)}
            </button>
          ))}
        </div>
      </div>

      {catalogStatus.isLoading && <div className="catalog-loading" role="status" aria-label={loadingText} />}
      {!catalogStatus.isLoading && catalogStatus.error && <p className="catalog-notice">{catalogStatus.error}</p>}

      <div className="container product-grid" aria-busy={catalogStatus.isLoading}>
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!catalogStatus.isLoading && filteredProducts.length === 0 && (
        <p className="empty-state">{t('products.empty')}</p>
      )}
      {!catalogStatus.isLoading && filteredProducts.length > PRODUCTS_PER_PAGE && (
        <nav className="pagination" aria-label={t('products.paginationLabel')}>
          <button
            type="button"
            className="pagination__button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={activePage === 1}
            aria-label={t('products.previous')}
          >
            <PreviousIcon size={17} aria-hidden="true" />
            <span>{t('products.previous')}</span>
          </button>

          <div className="pagination__pages">
            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                className={page === activePage ? 'pagination__page pagination__page--active' : 'pagination__page'}
                onClick={() => setCurrentPage(page)}
                aria-current={page === activePage ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
          </div>

          <span className="pagination__status">{pageStatus}</span>

          <button
            type="button"
            className="pagination__button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={activePage === totalPages}
            aria-label={t('products.next')}
          >
            <span>{t('products.next')}</span>
            <NextIcon size={17} aria-hidden="true" />
          </button>
        </nav>
      )}
    </section>
  );
}
