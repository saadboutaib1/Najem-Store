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

export default function AdminPagination({ page, pageSize, totalItems, onPageChange, labels }) {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

  if (totalItems <= safePageSize) {
    return null;
  }

  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const firstItem = (currentPage - 1) * safePageSize + 1;
  const lastItem = Math.min(currentPage * safePageSize, totalItems);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  function goToPage(nextPage) {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);

    if (safePage !== currentPage) {
      onPageChange(safePage);
    }
  }

  return (
    <nav className="admin-pagination" aria-label={labels.navigation}>
      <div className="admin-pagination__summary">
        <strong>{fillTemplate(labels.summary, { from: firstItem, to: lastItem, total: totalItems })}</strong>
        <span>{fillTemplate(labels.pageInfo, { page: currentPage, pages: totalPages })}</span>
      </div>

      <div className="admin-pagination__controls">
        <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          {labels.previous}
        </button>

        <div className="admin-pagination__pages">
          {visiblePages[0] > 1 && (
            <>
              <button type="button" aria-label={fillTemplate(labels.pageLabel, { page: 1 })} onClick={() => goToPage(1)}>
                1
              </button>
              {visiblePages[0] > 2 && <span>...</span>}
            </>
          )}

          {visiblePages.map((pageNumber) => (
            <button
              className={pageNumber === currentPage ? 'admin-pagination__page--active' : ''}
              type="button"
              aria-label={fillTemplate(labels.pageLabel, { page: pageNumber })}
              aria-current={pageNumber === currentPage ? 'page' : undefined}
              onClick={() => goToPage(pageNumber)}
              key={pageNumber}
            >
              {pageNumber}
            </button>
          ))}

          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && <span>...</span>}
              <button type="button" aria-label={fillTemplate(labels.pageLabel, { page: totalPages })} onClick={() => goToPage(totalPages)}>
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
          {labels.next}
        </button>
      </div>
    </nav>
  );
}
