import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Pagination from '../components/common/Pagination.jsx';
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
  const { language, t } = useLanguage();
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
  const loadingText = t('common.loadingProducts');
  const offlineText = t('common.catalogOffline');

  const filteredProducts = useMemo(() => {
    return filterProductList(products, { category: selectedCategory, searchTerm, language });
  }, [language, products, searchTerm, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (activePage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [activePage, filteredProducts]);
  useEffect(() => {
    setCurrentPage(1);
  }, [language, searchTerm, selectedCategory]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
        <span className="eyebrow">MAGHRIB OUD</span>
        <h1>
          {activeCategory ? getLocalizedField(activeCategory, 'name', language) : t('products.title')}
        </h1>
        {activeCategory && <p>{getLocalizedField(activeCategory, 'description', language)}</p>}
      </div>

      <div className="container product-toolbar">
        <div className="search-box">
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
      {!catalogStatus.isLoading && (
        <Pagination
          page={activePage}
          pageSize={PRODUCTS_PER_PAGE}
          totalItems={filteredProducts.length}
          onPageChange={setCurrentPage}
        />
      )}
    </section>
  );
}
