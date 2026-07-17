import { Edit3, ImageUp, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminCard from '../../components/admin/AdminCard.jsx';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import AdminPagination from '../../components/admin/AdminPagination.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import { AdminEmptyState, AdminErrorState } from '../../components/admin/AdminStates.jsx';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx';
import AdminTableWrapper from '../../components/admin/AdminTableWrapper.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getAdminText } from '../../i18n/admin.js';
import { deleteCategory, getCategories } from '../../services/adminApi.js';
import { getLocalizedField } from '../../utils/formatters.js';

const CATEGORIES_PER_PAGE = 8;

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { language } = useLanguage();
  const { showToast } = useToast();
  const ta = (path, fallback) => getAdminText(language, path, fallback);

  async function loadCategories() {
    setIsLoading(true);
    setError('');

    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setError(ta('errors.loadCategories'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, [language]);

  const totalPages = Math.max(1, Math.ceil(categories.length / CATEGORIES_PER_PAGE));
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * CATEGORIES_PER_PAGE;

    return categories.slice(start, start + CATEGORIES_PER_PAGE);
  }, [categories, currentPage]);

  const paginationLabels = useMemo(
    () => ({
      navigation: ta('pagination.navigation'),
      previous: ta('pagination.previous'),
      next: ta('pagination.next'),
      pageLabel: ta('pagination.pageLabel'),
    }),
    [language]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function getCategoryName(category) {
    return getLocalizedField(category || {}, 'name', language);
  }

  async function confirmDelete() {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCategory(categoryToDelete.id);
      showToast(ta('common.successDeleted'));
      setCategoryToDelete(null);
      await loadCategories();
    } catch {
      setError(ta('errors.deleteCategory'));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="admin-page">
      <AdminPageHeader
        title={ta('categories.title')}
        subtitle={ta('categories.subtitle')}
        actions={
          <Link className="admin-button admin-button--primary" to="/admin/categories/create">
            <Plus size={16} />
            <span>{ta('categories.addCategory')}</span>
          </Link>
        }
      />

      <AdminErrorState message={error} />

      <AdminCard
        title={ta('categories.listTitle')}
        actions={
          error ? (
            <button className="admin-text-button" type="button" onClick={loadCategories}>
              {ta('common.retry')}
            </button>
          ) : null
        }
      >
        <AdminTableWrapper minWidth={920}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{ta('common.image')}</th>
                <th>{ta('common.nameAr')}</th>
                <th>{ta('common.nameFr')}</th>
                <th>{ta('common.nameEn')}</th>
                <th>{ta('common.slug')}</th>
                <th>{ta('categories.sortOrder')}</th>
                <th>{ta('common.status')}</th>
                <th>{ta('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="admin-thumb">{category.image ? <img src={category.image} alt="" /> : <ImageUp size={18} />}</div>
                  </td>
                  <td>
                    <strong>{category.name_ar}</strong>
                  </td>
                  <td>{category.name_fr}</td>
                  <td>{category.name_en}</td>
                  <td>{category.slug}</td>
                  <td>{category.sort_order}</td>
                  <td>
                    <AdminStatusBadge status={category.status} label={ta(`common.${category.status}`, category.status)} />
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <Link className="admin-icon-button" to={`/admin/categories/edit/${category.id}`} aria-label={ta('common.edit')}>
                        <Edit3 size={16} />
                      </Link>
                      <button className="admin-icon-button admin-icon-button--danger" type="button" onClick={() => setCategoryToDelete(category)} aria-label={ta('common.delete')}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan="8">{ta('common.loading')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </AdminTableWrapper>

        {!categories.length && !isLoading && <AdminEmptyState message={ta('common.noData')} />}
        {!isLoading && (
          <AdminPagination
            page={currentPage}
            pageSize={CATEGORIES_PER_PAGE}
            totalItems={categories.length}
            labels={paginationLabels}
            onPageChange={setCurrentPage}
          />
        )}
      </AdminCard>

      <AdminConfirmDialog
        open={Boolean(categoryToDelete)}
        title={ta('common.delete')}
        message={ta('common.confirmDelete').replace('{name}', getCategoryName(categoryToDelete) || categoryToDelete?.slug || categoryToDelete?.id || '')}
        confirmLabel={ta('common.delete')}
        cancelLabel={ta('common.cancel')}
        isLoading={isDeleting}
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
