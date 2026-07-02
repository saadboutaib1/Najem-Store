import { ArrowLeft, ImageUp, Plus, RotateCcw, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminCard from '../../components/admin/AdminCard.jsx';
import AdminFormLayout from '../../components/admin/AdminFormLayout.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import AdminSelect from '../../components/admin/AdminSelect.jsx';
import { AdminErrorState, AdminLoadingState } from '../../components/admin/AdminStates.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getAdminText } from '../../i18n/admin.js';
import { createProduct, getCategories, getProduct, updateProduct } from '../../services/adminApi.js';

const emptyProductForm = {
  category_id: '',
  name_ar: '',
  name_en: '',
  slug: '',
  description_ar: '',
  description_en: '',
  price: '',
  old_price: '',
  stock: 0,
  status: 'active',
  is_featured: false,
};

function buildProductFormData(form, imageFile) {
  const formData = new FormData();

  Object.entries(form).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });

  formData.set('is_featured', form.is_featured ? '1' : '0');

  if (imageFile) {
    formData.append('main_image', imageFile);
  }

  return formData;
}

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyProductForm);
  const [initialForm, setInitialForm] = useState(emptyProductForm);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [initialImagePreview, setInitialImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { language } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const ta = (path, fallback) => getAdminText(language, path, fallback);

  useEffect(() => {
    let isMounted = true;

    async function loadFormData() {
      setIsLoading(true);
      setError('');

      try {
        const [nextCategories, product] = await Promise.all([getCategories(), isEditing ? getProduct(id) : Promise.resolve(null)]);

        if (!isMounted) return;

        setCategories(Array.isArray(nextCategories) ? nextCategories : []);

        if (product) {
          const nextImagePreview = product.image || product.main_image || '';
          const nextForm = {
            category_id: product.category_id || '',
            name_ar: product.name_ar || '',
            name_en: product.name_en || '',
            slug: product.slug || '',
            description_ar: product.description_ar || '',
            description_en: product.description_en || '',
            price: product.price ?? '',
            old_price: product.old_price ?? product.oldPrice ?? '',
            stock: product.stock ?? 0,
            status: product.status || 'active',
            is_featured: Boolean(product.is_featured || product.isFeatured),
          };

          setImageFile(null);
          setImagePreview(nextImagePreview);
          setInitialImagePreview(nextImagePreview);
          setForm(nextForm);
          setInitialForm(nextForm);
        } else {
          const nextForm = { ...emptyProductForm };
          setImageFile(null);
          setImagePreview('');
          setInitialImagePreview('');
          setForm(nextForm);
          setInitialForm(nextForm);
        }
      } catch {
        if (isMounted) {
          setError(isEditing ? ta('errors.loadProducts') : ta('errors.loadCategories'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFormData();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  const categoryOptions = useMemo(
    () =>
      [
        { value: '', label: ta('products.chooseCategory') },
        ...categories.map((category) => ({
          value: String(category.id),
          label: language === 'ar' ? category.name_ar : category.name_en,
        })),
      ],
    [categories, language]
  );

  const statusOptions = useMemo(
    () => [
      { value: 'active', label: ta('common.active') },
      { value: 'inactive', label: ta('common.inactive') },
    ],
    [language]
  );

  function updateField(event) {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function updateImage(event) {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : imagePreview);
  }

  function resetForm() {
    setError('');
    setImageFile(null);
    setImagePreview(initialImagePreview);
    setForm(initialForm);
  }

  function validateForm() {
    if (!form.name_ar.trim() || !form.name_en.trim() || !form.category_id || form.price === '' || form.stock === '') {
      return ta('common.validationRequired');
    }

    if (Number(form.price) <= 0) {
      return ta('common.validationPositivePrice');
    }

    if (Number(form.stock) < 0) {
      return ta('common.validationStock');
    }

    return '';
  }

  function buildPayload() {
    const normalizedForm = {
      ...form,
      category_id: Number(form.category_id),
      price: Number(form.price || 0),
      old_price: form.old_price === '' ? null : Number(form.old_price),
      stock: Number(form.stock || 0),
      is_featured: Boolean(form.is_featured),
    };

    return imageFile ? buildProductFormData(normalizedForm, imageFile) : normalizedForm;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing) {
        await updateProduct(id, buildPayload());
      } else {
        await createProduct(buildPayload());
      }

      showToast(ta('common.successSaved'));
      navigate('/admin/products');
    } catch {
      setError(ta('errors.saveProduct'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="admin-page admin-page--narrow">
      <AdminPageHeader
        title={isEditing ? ta('products.editTitle') : ta('products.createTitle')}
        subtitle={isEditing ? ta('products.editSubtitle') : ta('products.createSubtitle')}
        actions={
          <Link className="admin-button admin-button--ghost" to="/admin/products">
            <ArrowLeft size={16} />
            <span>{ta('common.back')}</span>
          </Link>
        }
      />

      <AdminErrorState message={error} />

      <AdminCard title={ta('products.formTitle')}>
        {isLoading ? (
          <AdminLoadingState message={ta('common.loading')} />
        ) : (
          <AdminFormLayout
            onSubmit={handleSubmit}
            actions={
              <>
                <button className="admin-button admin-button--primary" type="submit" disabled={isSaving}>
                  {isEditing ? <Save size={16} /> : <Plus size={16} />}
                  <span>{isSaving ? ta('common.loading') : isEditing ? ta('common.save') : ta('common.add')}</span>
                </button>
                <button className="admin-button admin-button--ghost" type="button" onClick={resetForm} disabled={isSaving}>
                  <RotateCcw size={16} />
                  <span>{ta('common.reset')}</span>
                </button>
                <Link className="admin-button admin-button--ghost" to="/admin/products">
                  {ta('common.cancel')}
                </Link>
              </>
            }
          >
            <label>
              <span>
                {ta('common.category')} <em>{ta('common.required')}</em>
              </span>
              <AdminSelect
                ariaLabel={ta('common.category')}
                value={form.category_id}
                options={categoryOptions}
                onChange={(value) => setForm((current) => ({ ...current, category_id: value }))}
              />
            </label>
            <label>
              <span>{ta('common.status')}</span>
              <AdminSelect
                ariaLabel={ta('common.status')}
                value={form.status}
                options={statusOptions}
                onChange={(value) => setForm((current) => ({ ...current, status: value }))}
              />
            </label>
            <label className="admin-check-row admin-check-row--featured admin-form__wide">
              <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={updateField} />
              <span>
                <strong>{ta('products.showInFeatured')}</strong>
              </span>
            </label>
            <label>
              <span>
                {ta('common.nameAr')} <em>{ta('common.required')}</em>
              </span>
              <input name="name_ar" value={form.name_ar} onChange={updateField} required />
            </label>
            <label>
              <span>
                {ta('common.nameEn')} <em>{ta('common.required')}</em>
              </span>
              <input name="name_en" value={form.name_en} onChange={updateField} required />
            </label>
            <label>
              <span>{ta('common.slug')}</span>
              <input name="slug" value={form.slug} onChange={updateField} />
            </label>
            <label>
              <span>
                {ta('common.price')} <em>{ta('common.required')}</em>
              </span>
              <input type="number" min="0" step="0.01" name="price" value={form.price} onChange={updateField} required />
            </label>
            <label>
              <span>{ta('common.oldPrice')}</span>
              <input type="number" min="0" step="0.01" name="old_price" value={form.old_price} onChange={updateField} />
            </label>
            <label>
              <span>
                {ta('common.stock')} <em>{ta('common.required')}</em>
              </span>
              <input type="number" min="0" name="stock" value={form.stock} onChange={updateField} required />
            </label>
            <div className="admin-image-field admin-form__wide">
              <div className="admin-image-preview admin-image-preview--wide">
                {imagePreview ? <img src={imagePreview} alt={ta('common.preview')} /> : <ImageUp size={34} />}
              </div>
              <label className="admin-file-control">
                <span>{imagePreview ? ta('common.changeImage') : ta('common.uploadImage')}</span>
                <input type="file" accept="image/*" onChange={updateImage} />
              </label>
            </div>

            <label className="admin-form__wide">
              <span>{ta('common.descriptionAr')}</span>
              <textarea name="description_ar" value={form.description_ar} onChange={updateField} rows="3" />
            </label>
            <label className="admin-form__wide">
              <span>{ta('common.descriptionEn')}</span>
              <textarea name="description_en" value={form.description_en} onChange={updateField} rows="3" />
            </label>
          </AdminFormLayout>
        )}
      </AdminCard>
    </section>
  );
}
