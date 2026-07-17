import { Eye, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminCard from '../../components/admin/AdminCard.jsx';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import AdminPagination from '../../components/admin/AdminPagination.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import AdminSelect from '../../components/admin/AdminSelect.jsx';
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from '../../components/admin/AdminStates.jsx';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx';
import AdminTableWrapper from '../../components/admin/AdminTableWrapper.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getAdminText } from '../../i18n/admin.js';
import { deleteOrder, getOrders } from '../../services/adminApi.js';
import { formatCurrency } from '../../utils/formatters.js';

const orderStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
const ORDERS_PER_PAGE = 8;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { language } = useLanguage();
  const { showToast } = useToast();
  const ta = (path, fallback) => getAdminText(language, path, fallback);

  async function loadOrders() {
    setIsLoading(true);
    setError('');

    try {
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(ta('errors.loadOrders'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        [order.order_number, order.customer_name, order.customer_phone, order.city]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));
      const matchesStatus = !statusFilter || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE;

    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [currentPage, filteredOrders]);

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
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const statusOptions = useMemo(
    () => [
      { value: '', label: ta('orders.allStatuses') },
      ...orderStatuses.map((status) => ({
        value: status,
        label: ta(`orders.${status}`, status),
      })),
    ],
    [language]
  );

  function formatDate(date) {
    if (!date) return '-';

    return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-MA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  async function confirmDelete() {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOrder(orderToDelete.id);
      showToast(ta('common.successDeleted'));
      setOrderToDelete(null);
      await loadOrders();
    } catch (deleteError) {
      setError(ta('errors.deleteOrder'));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="admin-page">
      <AdminPageHeader
        title={ta('orders.title')}
        subtitle={ta('orders.subtitle')}
        actions={null}
      />

      <AdminErrorState message={error} />

      <AdminCard
        title={ta('orders.listTitle')}
        actions={
          error ? (
            <button className="admin-text-button" type="button" onClick={loadOrders}>
              {ta('common.retry')}
            </button>
          ) : null
        }
      >
        <div className="admin-filter-bar admin-filter-bar--orders">
          <label className="admin-search-field">
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={ta('orders.searchPlaceholder')} />
          </label>
          <AdminSelect
            ariaLabel={ta('orders.allStatuses')}
            value={statusFilter}
            options={statusOptions}
            onChange={setStatusFilter}
          />
        </div>

        {isLoading ? (
          <AdminLoadingState message={ta('common.loading')} />
        ) : (
          <>
            <AdminTableWrapper minWidth={820}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{ta('orders.orderNumber')}</th>
                    <th>{ta('orders.customer')}</th>
                    <th>{ta('orders.phone')}</th>
                    <th>{ta('orders.city')}</th>
                    <th>{ta('common.total')}</th>
                    <th>{ta('common.status')}</th>
                    <th>{ta('common.createdAt')}</th>
                    <th>{ta('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link to={`/admin/orders/${order.id}`}>{order.order_number}</Link>
                      </td>
                      <td>{order.customer_name}</td>
                      <td dir="ltr">{order.customer_phone}</td>
                      <td>{order.city}</td>
                      <td>{formatCurrency(order.total, language)}</td>
                      <td>
                        <AdminStatusBadge status={order.status} label={ta(`orders.${order.status}`, order.status)} />
                      </td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>
                        <div className="admin-row-actions">
                          <Link className="admin-icon-button" to={`/admin/orders/${order.id}`} aria-label={ta('orders.details')}>
                            <Eye size={16} />
                          </Link>
                          <button className="admin-icon-button admin-icon-button--danger" type="button" onClick={() => setOrderToDelete(order)} aria-label={ta('common.delete')}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableWrapper>

            {!filteredOrders.length && <AdminEmptyState message={ta('common.noData')} />}
            <AdminPagination
              page={currentPage}
              pageSize={ORDERS_PER_PAGE}
              totalItems={filteredOrders.length}
              labels={paginationLabels}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </AdminCard>

      <AdminConfirmDialog
        open={Boolean(orderToDelete)}
        title={ta('common.delete')}
        message={ta('common.confirmDelete').replace('{name}', orderToDelete?.order_number || '')}
        confirmLabel={ta('common.delete')}
        cancelLabel={ta('common.cancel')}
        isLoading={isDeleting}
        onCancel={() => setOrderToDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
