import { useEffect, useMemo, useState } from 'react';
import CategoryCard from '../components/common/CategoryCard.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getCategories as getFallbackCategories } from '../services/catalogService.js';
import { getCategories as getApiCategories } from '../services/api.js';
import { adaptCategories } from '../utils/adapters.js';

const CATEGORIES_PER_PAGE = 4;

export default function Categories() {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState(getFallbackCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const [catalogStatus, setCatalogStatus] = useState({ isLoading: true, error: '' });
  const loadingText = t('common.loadingCategories');
  const offlineText = t('common.catalogOffline');

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      setCatalogStatus({ isLoading: true, error: '' });

      try {
        const apiCategories = await getApiCategories();
        if (!isMounted) return;
        setCategories(adaptCategories(apiCategories));
        setCatalogStatus({ isLoading: false, error: '' });
      } catch {
        if (!isMounted) return;
        setCategories(getFallbackCategories());
        setCatalogStatus({ isLoading: false, error: offlineText });
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [offlineText]);

  const totalPages = Math.max(1, Math.ceil(categories.length / CATEGORIES_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedCategories = useMemo(() => {
    const start = (activePage - 1) * CATEGORIES_PER_PAGE;

    return categories.slice(start, start + CATEGORIES_PER_PAGE);
  }, [activePage, categories]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <section className="page-section">
      <div className="container section-heading">
        <span className="eyebrow">MAGHRIB OUD</span>
        <h1>{t('categories.title')}</h1>
      </div>
      {catalogStatus.isLoading && <div className="catalog-loading" role="status" aria-label={loadingText} />}
      {!catalogStatus.isLoading && catalogStatus.error && <p className="catalog-notice">{catalogStatus.error}</p>}
      <div className="container category-grid" aria-busy={catalogStatus.isLoading}>
        {paginatedCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
      {!catalogStatus.isLoading && (
        <Pagination
          page={activePage}
          pageSize={CATEGORIES_PER_PAGE}
          totalItems={categories.length}
          onPageChange={setCurrentPage}
          alwaysVisible
        />
      )}
    </section>
  );
}
