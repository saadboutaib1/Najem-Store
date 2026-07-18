import { ArrowLeft, ClipboardCopy, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminCard from '../../components/admin/AdminCard.jsx';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import AdminSelect from '../../components/admin/AdminSelect.jsx';
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from '../../components/admin/AdminStates.jsx';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx';
import AdminTableWrapper from '../../components/admin/AdminTableWrapper.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getAdminText } from '../../i18n/admin.js';
import { deleteOrder, getOrder, updateOrderStatus } from '../../services/adminApi.js';
import { formatCurrency } from '../../utils/formatters.js';

const orderStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const { language } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const ta = (path, fallback) => getAdminText(language, path, fallback);
  const statusOptions = orderStatuses.map((nextStatus) => ({
    value: nextStatus,
    label: ta(`orders.${nextStatus}`, nextStatus),
  }));

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      setIsLoading(true);
      setError('');

      try {
        const data = await getOrder(id);

        if (isMounted) {
          setOrder(data);
          setStatus(data.status || 'pending');
        }
      } catch {
        if (isMounted) {
          setError(ta('errors.loadOrder'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [id]);

  function formatDate(date) {
    if (!date) return '-';

    return new Date(date).toLocaleString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-MA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async function handleStatusSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const updatedOrder = await updateOrderStatus(id, status);
      setOrder(updatedOrder);
      setStatus(updatedOrder.status);
      showToast(ta('common.successSaved'));
    } catch {
      setError(ta('errors.updateOrder'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!order) return;
    setIsDeleting(true);
    try {
      await deleteOrder(order.id);
      showToast(ta('common.successDeleted'));
      navigate('/admin/orders', { replace: true });
    } catch {
      setError(ta('errors.deleteOrder'));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleCopyMessage() {
    if (!order?.whatsapp_message) return;

    try {
      await navigator.clipboard.writeText(order.whatsapp_message);
      showToast(ta('orders.copySuccess'));
    } catch {
      setError(ta('orders.copyFailed'));
    }
  }

  return (
    <section className="admin-page">
      <AdminPageHeader
        title={order?.order_number || ta('orders.details')}
        subtitle={ta('orders.detailsSubtitle')}
        actions={
          <>
            <Link className="admin-button admin-button--ghost" to="/admin/orders">
              <ArrowLeft size={16} />
              <span>{ta('common.back')}</span>
            </Link>
            {order && (
              <button className="admin-button admin-button--danger" type="button" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={16} />
                <span>{ta('common.delete')}</span>
              </button>
            )}
          </>
        }
      />

      <AdminErrorState message={error} />

      {isLoading && <AdminLoadingState message={ta('common.loading')} />}

      {!isLoading && !order && !error && <AdminEmptyState message={ta('common.noData')} />}

      {order && (
        <>
          <div className="admin-order-grid">
            <AdminCard
              title={ta('orders.customerInfo')}
              actions={<AdminStatusBadge status={order.status} label={ta(`orders.${order.status}`, order.status)} />}
            >
              <dl className="admin-details-list">
                <div>
                  <dt>{ta('orders.orderNumber')}</dt>
                  <dd>{order.order_number}</dd>
                </div>
                <div>
                  <dt>{ta('orders.customer')}</dt>
                  <dd>{order.customer_name}</dd>
                </div>
                <div>
                  <dt>{ta('orders.phone')}</dt>
                  <dd className="admin-details-list__phone" dir="ltr">{order.customer_phone}</dd>
                </div>
                <div>
                  <dt>{ta('orders.city')}</dt>
                  <dd>{order.city}</dd>
                </div>
                <div>
                  <dt>{ta('orders.address')}</dt>
                  <dd>{order.address}</dd>
                </div>
                <div>
                  <dt>{ta('orders.notes')}</dt>
                  <dd>{order.notes || '-'}</dd>
                </div>
                <div>
                  <dt>{ta('common.createdAt')}</dt>
                  <dd>{formatDate(order.created_at)}</dd>
                </div>
              </dl>

              <form className="admin-inline-form" onSubmit={handleStatusSubmit}>
                <label>
                  <span>{ta('orders.updateStatus')}</span>
                  <AdminSelect
                    ariaLabel={ta('orders.updateStatus')}
                    value={status}
                    options={statusOptions}
                    onChange={setStatus}
                  />
                </label>
                <button className="admin-button admin-button--primary" type="submit" disabled={isSaving}>
                  <Save size={16} />
                  <span>{isSaving ? ta('common.loading') : ta('common.save')}</span>
                </button>
              </form>
            </AdminCard>

            <AdminCard title={ta('orders.summary')}>
              <div className="admin-total-card admin-total-card--plain">
                <div>
                  <span>{ta('orders.subtotal')}</span>
                  <strong>{formatCurrency(order.subtotal, language)}</strong>
                </div>
                <div>
                  <span>{ta('orders.deliveryFee')}</span>
                  <strong>{formatCurrency(order.delivery_fee, language)}</strong>
                </div>
                <div>
                  <span>{ta('common.total')}</span>
                  <strong>{formatCurrency(order.total, language)}</strong>
                </div>
                <div>
                  <span>{ta('orders.payment')}</span>
                  <strong>{order.payment_method === 'cash_on_delivery' ? ta('orders.cashOnDelivery') : order.payment_method}</strong>
                </div>
              </div>
            </AdminCard>
          </div>

          <AdminCard title={ta('orders.items')}>
            <AdminTableWrapper minWidth={620}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{ta('common.products')}</th>
                    <th>{ta('orders.quantity')}</th>
                    <th>{ta('orders.unitPrice')}</th>
                    <th>{ta('common.total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item) => (
                    <tr key={item.id}>
                      <td>{language === 'ar' ? item.product_name_ar : language === 'fr' ? (item.product_name_fr || item.product_name_en) : item.product_name_en}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unit_price, language)}</td>
                      <td>{formatCurrency(item.total_price, language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableWrapper>

            {!(order.items || []).length && <AdminEmptyState message={ta('common.noData')} />}
          </AdminCard>

          <AdminCard
            title={ta('orders.whatsappMessage')}
            actions={
              order.whatsapp_message && (
                <button className="admin-text-button" type="button" onClick={handleCopyMessage}>
                  <ClipboardCopy size={16} />
                  <span>{ta('orders.copyWhatsapp')}</span>
                </button>
              )
            }
          >
            {order.whatsapp_message ? (
              <pre className="admin-message-box" dir="auto">{order.whatsapp_message}</pre>
            ) : (
              <p className="admin-muted-text">{ta('orders.noWhatsappMessage')}</p>
            )}
          </AdminCard>
        </>
      )}

      <AdminConfirmDialog
        open={showDeleteConfirm}
        title={ta('common.delete')}
        message={ta('common.confirmDelete').replace('{name}', order?.order_number || '')}
        confirmLabel={ta('common.delete')}
        cancelLabel={ta('common.cancel')}
        isLoading={isDeleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
