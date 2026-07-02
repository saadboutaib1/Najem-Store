import { Save, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminCard from '../../components/admin/AdminCard.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import { AdminErrorState } from '../../components/admin/AdminStates.jsx';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getAdminText } from '../../i18n/admin.js';

export default function AdminProfile() {
  const { admin, updateProfile, changePassword } = useAdminAuth();
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { language } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const ta = (path, fallback) => getAdminText(language, path, fallback);

  useEffect(() => {
    if (admin) {
      setProfileForm({
        name: admin.name || '',
        email: admin.email || '',
      });
    }
  }, [admin]);

  function updateProfileField(event) {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  }

  function updatePasswordField(event) {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  }

  function hasPasswordChanges() {
    return Boolean(passwordForm.current_password || passwordForm.password || passwordForm.password_confirmation);
  }

  function resetPasswordFields() {
    setPasswordForm({
      current_password: '',
      password: '',
      password_confirmation: '',
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setError(ta('common.validationRequired'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) {
      setError(ta('profile.emailInvalid'));
      return;
    }

    const shouldChangePassword = hasPasswordChanges();

    if (shouldChangePassword) {
      if (!passwordForm.current_password || !passwordForm.password || !passwordForm.password_confirmation) {
        setError(ta('profile.passwordFieldsRequired'));
        return;
      }

      if (passwordForm.password.length < 8) {
        setError(ta('profile.passwordMin'));
        return;
      }

      if (passwordForm.password !== passwordForm.password_confirmation) {
        setError(ta('profile.passwordMismatch'));
        return;
      }
    }

    setIsSaving(true);

    try {
      try {
        await updateProfile({
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
        });
      } catch (profileError) {
        setError(ta('errors.updateProfile'));
        return;
      }

      if (shouldChangePassword) {
        try {
          await changePassword(passwordForm);
        } catch (passwordError) {
          setError(ta('errors.changePassword'));
          return;
        }

        showToast(ta('profile.passwordChanged'));
        navigate('/admin/login', { replace: true });
        return;
      }

      resetPasswordFields();
      showToast(ta('profile.profileUpdated'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="admin-page admin-page--narrow">
      <AdminPageHeader title={ta('profile.title')} subtitle={ta('profile.subtitle')} />

      <AdminErrorState message={error} />

      <AdminCard
        title={ta('profile.cardTitle')}
        actions={
          <span className="admin-profile-card__icon" aria-hidden="true">
            <UserRound size={18} />
          </span>
        }
        className="admin-profile-card"
      >
        <form className="admin-form admin-form--grid admin-profile-form" onSubmit={handleSubmit}>
          <h3 className="admin-form-section-title">{ta('profile.accountDetails')}</h3>

          <label>
            <span>
              {ta('profile.name')} <em>{ta('common.required')}</em>
            </span>
            <input name="name" value={profileForm.name} onChange={updateProfileField} required />
          </label>

          <label>
            <span>
              {ta('profile.email')} <em>{ta('common.required')}</em>
            </span>
            <input type="email" name="email" value={profileForm.email} onChange={updateProfileField} required />
          </label>

          <div className="admin-profile-password-note admin-form__wide">
            <ShieldCheck size={18} />
            <div>
              <strong>{ta('profile.changePassword')}</strong>
              <p>{ta('profile.passwordOptional')}</p>
            </div>
          </div>

          <label>
            <span>{ta('profile.currentPassword')}</span>
            <input
              type="password"
              name="current_password"
              value={passwordForm.current_password}
              onChange={updatePasswordField}
              autoComplete="current-password"
            />
          </label>

          <label>
            <span>{ta('profile.newPassword')}</span>
            <input
              type="password"
              name="password"
              value={passwordForm.password}
              onChange={updatePasswordField}
              minLength="8"
              autoComplete="new-password"
            />
          </label>

          <label className="admin-form__wide">
            <span>{ta('profile.confirmPassword')}</span>
            <input
              type="password"
              name="password_confirmation"
              value={passwordForm.password_confirmation}
              onChange={updatePasswordField}
              minLength="8"
              autoComplete="new-password"
            />
          </label>

          <div className="admin-form-actions admin-form__wide admin-profile-actions">
            <button className="admin-button admin-button--ghost" type="button" onClick={resetPasswordFields} disabled={isSaving}>
              {ta('common.reset')}
            </button>
            <button className="admin-button admin-button--primary" type="submit" disabled={isSaving}>
              <Save size={16} />
              <span>{isSaving ? ta('common.loading') : ta('profile.saveChanges')}</span>
            </button>
          </div>
        </form>
      </AdminCard>
    </section>
  );
}
