import { ArrowLeft, ImageUp, Plus, RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminCard from '../../components/admin/AdminCard.jsx';
import AdminFormLayout from '../../components/admin/AdminFormLayout.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import AdminSelect from '../../components/admin/AdminSelect.jsx';
import { AdminErrorState, AdminLoadingState } from '../../components/admin/AdminStates.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getAdminText } from '../../i18n/admin.js';
import { createCategory, getCategories, updateCategory } from '../../services/adminApi.js';

const emptyCategoryForm = {
  name_ar: '',
  name_en: '',
  slug: '',
  description_ar: '',
  description_en: '',
  status: 'active',
  sort_order: 0,
};

function buildCategoryFormData(form, imageFile) {
  const formData = new FormData();

  Object.entries(form).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });

  if (imageFile) {
    formData.append('image', imageFile);
  }

  return formData;
}

export default function AdminCategoryForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyCategoryForm);
  const [initialForm, setInitialForm] = useState(emptyCategoryForm);
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
  const statusOptions = [
    { value: 'active', label: ta('common.active') },
    { value: 'inactive', label: ta('common.inactive') },
  ];

  useEffect(() => {
    let isMounted = true;

    async function loadCategory() {
      if (!isEditing) {
        const nextForm = { ...emptyCategoryForm };
        setForm(nextForm);
        setInitialForm(nextForm);
        setImageFile(null);
        setImagePreview('');
        setInitialImagePreview('');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const categories = await getCategories();
        const category = (Array.isArray(categories) ? categories : []).find((item) => String(item.id) === String(id));

        if (!isMounted) return;

        if (!category) {
          setError(ta('errors.loadCategories'));
          return;
        }

        const nextImagePreview = category.image || '';
        const nextForm = {
          name_ar: category.name_ar || '',
          name_en: category.name_en || '',
          slug: category.slug || '',
          description_ar: category.description_ar || '',
          description_en: category.description_en || '',
          status: category.status || 'active',
          sort_order: category.sort_order || 0,
        };

        setImageFile(null);
        setImagePreview(nextImagePreview);
        setInitialImagePreview(nextImagePreview);
        setForm(nextForm);
        setInitialForm(nextForm);
      } catch {
        if (isMounted) {
          setError(ta('errors.loadCategories'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCategory();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
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
    if (!form.name_ar.trim() || !form.name_en.trim()) {
      return ta('common.validationRequired');
    }

    if (Number(form.sort_order || 0) < 0) {
      return ta('common.validationNonNegative');
    }

    return '';
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

    const payload = imageFile
      ? buildCategoryFormData({ ...form, sort_order: Number(form.sort_order || 0) }, imageFile)
      : { ...form, sort_order: Number(form.sort_order || 0) };

    try {
      if (isEditing) {
        await updateCategory(id, payload);
      } else {
        await createCategory(payload);
      }

      showToast(ta('common.successSaved'));
      navigate('/admin/categories');
    } catch {
      setError(ta('errors.saveCategory'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="admin-page admin-page--narrow">
      <AdminPageHeader
        title={isEditing ? ta('categories.editTitle') : ta('categories.createTitle')}
        subtitle={isEditing ? ta('categories.editSubtitle') : ta('categories.createSubtitle')}
        actions={
          <Link className="admin-button admin-button--ghost" to="/admin/categories">
            <ArrowLeft size={16} />
            <span>{ta('common.back')}</span>
          </Link>
        }
      />

      <AdminErrorState message={error} />

      <AdminCard title={ta('categories.formTitle')}>
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
                <Link className="admin-button admin-button--ghost" to="/admin/categories">
                  {ta('common.cancel')}
                </Link>
              </>
            }
          >
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
              <span>{ta('categories.sortOrder')}</span>
              <input type="number" min="0" name="sort_order" value={form.sort_order} onChange={updateField} />
            </label>
            <label className="admin-form__wide">
              <span>{ta('common.descriptionAr')}</span>
              <textarea name="description_ar" value={form.description_ar} onChange={updateField} rows="3" />
            </label>
            <label className="admin-form__wide">
              <span>{ta('common.descriptionEn')}</span>
              <textarea name="description_en" value={form.description_en} onChange={updateField} rows="3" />
            </label>

            <div className="admin-image-field admin-form__wide">
              <div className="admin-image-preview">
                {imagePreview ? <img src={imagePreview} alt={ta('common.preview')} /> : <ImageUp size={34} />}
              </div>
              <label className="admin-file-control">
                <span>{imagePreview ? ta('common.changeImage') : ta('common.uploadImage')}</span>
                <input type="file" accept="image/*" onChange={updateImage} />
              </label>
            </div>

            <label>
              <span>{ta('common.status')}</span>
              <AdminSelect
                ariaLabel={ta('common.status')}
                value={form.status}
                options={statusOptions}
                onChange={(value) => setForm((current) => ({ ...current, status: value }))}
              />
            </label>
          </AdminFormLayout>
        )}
      </AdminCard>
    </section>
  );
}
