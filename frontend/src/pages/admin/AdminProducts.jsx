import { Edit3, ImageUp, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminCard from '../../components/admin/AdminCard.jsx';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import AdminPagination from '../../components/admin/AdminPagination.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import AdminSelect from '../../components/admin/AdminSelect.jsx';
import { AdminEmptyState, AdminErrorState } from '../../components/admin/AdminStates.jsx';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx';
import AdminTableWrapper from '../../components/admin/AdminTableWrapper.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getAdminText } from '../../i18n/admin.js';
import { deleteProduct, getCategories, getProducts } from '../../services/adminApi.js';
import { formatCurrency, getLocalizedField } from '../../utils/formatters.js';

const PRODUCTS_PER_PAGE = 8;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { language } = useLanguage();
  const { showToast } = useToast();
  const ta = (path, fallback) => getAdminText(language, path, fallback);

  async function loadData() {
    setIsLoading(true);
    setError('');

    try {
      const [nextProducts, nextCategories] = await Promise.all([getProducts(), getCategories()]);
      setProducts(Array.isArray(nextProducts) ? nextProducts : []);
      setCategories(Array.isArray(nextCategories) ? nextCategories : []);
    } catch {
      setError(ta('errors.loadProducts'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [language]);

  const categoryOptions = useMemo(
    () =>
      [
        { value: '', label: ta('products.allCategories') },
        ...categories.map((category) => ({
          value: String(category.id),
          label: getLocalizedField(category, 'name', language),
        })),
      ],
    [categories, language, ta]
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          product.name_ar,
          product.name_fr,
          product.name_en,
          product.slug,
          product.category,
          product.category_name_ar,
          product.category_name_fr,
          product.category_name_en,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));
      const matchesCategory = !categoryFilter || String(product.category_id) === String(categoryFilter);

      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, products, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;

    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [currentPage, filteredProducts]);

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
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function getProductName(product) {
    return getLocalizedField(product || {}, 'name', language);
  }

  async function confirmDelete() {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      showToast(ta('common.successDeleted'));
      setProductToDelete(null);
      await loadData();
    } catch {
      setError(ta('errors.deleteProduct'));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="admin-page">
      <AdminPageHeader
        title={ta('products.title')}
        subtitle={ta('products.subtitle')}
        actions={
          <Link className="admin-button admin-button--primary" to="/admin/products/create">
            <Plus size={16} />
            <span>{ta('products.addProduct')}</span>
          </Link>
        }
      />

      <AdminErrorState message={error} />

      <AdminCard
        title={ta('products.listTitle')}
        actions={
          error ? (
            <button className="admin-text-button" type="button" onClick={loadData}>
              {ta('common.retry')}
            </button>
          ) : null
        }
      >
        <div className="admin-filter-bar">
          <label className="admin-search-field">
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={ta('products.searchPlaceholder')} />
          </label>
          <AdminSelect
            ariaLabel={ta('products.allCategories')}
            value={categoryFilter}
            options={categoryOptions}
            onChange={setCategoryFilter}
          />
        </div>

        <AdminTableWrapper minWidth={760}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{ta('common.products')}</th>
                <th>{ta('common.category')}</th>
                <th>{ta('common.price')}</th>
                <th>{ta('common.stock')}</th>
                <th>{ta('common.status')}</th>
                <th>{ta('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-product-cell">
                      <div className="admin-thumb admin-thumb--product">
                        {product.image ? <img src={product.image} alt="" /> : <ImageUp size={18} />}
                      </div>
                      <div>
                        <strong>{getLocalizedField(product, 'name', language)}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{product[`category_name_${language}`] || product.category_name_ar || product.category_name_fr || product.category_name_en || product.category}</td>
                  <td>{formatCurrency(product.price, language)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <AdminStatusBadge status={product.status} label={ta(`common.${product.status}`, product.status)} />
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <Link className="admin-icon-button" to={`/admin/products/edit/${product.id}`} aria-label={ta('common.edit')}>
                        <Edit3 size={16} />
                      </Link>
                      <button className="admin-icon-button admin-icon-button--danger" type="button" onClick={() => setProductToDelete(product)} aria-label={ta('common.delete')}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan="6">{ta('common.loading')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </AdminTableWrapper>

        {!filteredProducts.length && !isLoading && <AdminEmptyState message={ta('common.noData')} />}
        {!isLoading && (
          <AdminPagination
            page={currentPage}
            pageSize={PRODUCTS_PER_PAGE}
            totalItems={filteredProducts.length}
            labels={paginationLabels}
            onPageChange={setCurrentPage}
          />
        )}
      </AdminCard>

      <AdminConfirmDialog
        open={Boolean(productToDelete)}
        title={ta('common.delete')}
        message={ta('common.confirmDelete').replace('{name}', getProductName(productToDelete) || productToDelete?.slug || productToDelete?.id || '')}
        confirmLabel={ta('common.delete')}
        cancelLabel={ta('common.cancel')}
        isLoading={isDeleting}
        onCancel={() => setProductToDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
