import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

function fillTemplate(template, values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template
  );
}

function getVisiblePages(currentPage, totalPages) {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
}

export default function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  alwaysVisible = false,
}) {
  const { direction, t } = useLanguage();
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

  if (!totalItems || (!alwaysVisible && totalPages <= 1)) {
    return null;
  }

  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const firstItem = (currentPage - 1) * safePageSize + 1;
  const lastItem = Math.min(currentPage * safePageSize, totalItems);
  const visiblePages = getVisiblePages(currentPage, totalPages);
  const PreviousIcon = direction === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = direction === 'rtl' ? ChevronLeft : ChevronRight;
  const summary = fillTemplate(t('pagination.summary'), {
    from: firstItem,
    to: lastItem,
    total: totalItems,
  });
  const pageInfo = fillTemplate(t('pagination.pageInfo'), {
    page: currentPage,
    pages: totalPages,
  });

  function goToPage(nextPage) {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);

    if (safePage !== currentPage) {
      onPageChange(safePage);
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  return (
    <nav className="pagination" aria-label={t('pagination.navigation')}>
      <button
        type="button"
        className="pagination__button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={t('pagination.previous')}
      >
        <PreviousIcon size={17} aria-hidden="true" />
        <span>{t('pagination.previous')}</span>
      </button>

      <div className="pagination__pages">
        {visiblePages[0] > 1 && (
          <>
            <button
              type="button"
              className="pagination__page"
              aria-label={fillTemplate(t('pagination.pageLabel'), { page: 1 })}
              onClick={() => goToPage(1)}
            >
              1
            </button>
            {visiblePages[0] > 2 && <span className="pagination__ellipsis">...</span>}
          </>
        )}

        {visiblePages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={pageNumber === currentPage ? 'pagination__page pagination__page--active' : 'pagination__page'}
            aria-label={fillTemplate(t('pagination.pageLabel'), { page: pageNumber })}
            aria-current={pageNumber === currentPage ? 'page' : undefined}
            onClick={() => goToPage(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && <span className="pagination__ellipsis">...</span>}
            <button
              type="button"
              className="pagination__page"
              aria-label={fillTemplate(t('pagination.pageLabel'), { page: totalPages })}
              onClick={() => goToPage(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <span className="pagination__status">
        <strong>{summary}</strong>
        <span>{pageInfo}</span>
      </span>

      <button
        type="button"
        className="pagination__button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={t('pagination.next')}
      >
        <span>{t('pagination.next')}</span>
        <NextIcon size={17} aria-hidden="true" />
      </button>
    </nav>
  );
}
