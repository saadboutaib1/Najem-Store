import { AlertCircle, ArrowLeft, Eye, EyeOff, Languages, Loader2, LockKeyhole, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/common/Logo.jsx';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getAdminText } from '../../i18n/admin.js';

export default function AdminLogin() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageControlRef = useRef(null);
  const { login, isAuthenticated, isChecking } = useAdminAuth();
  const { language, languageOptions, direction, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const ta = (path, fallback) => getAdminText(language, path, fallback);
  const currentLanguage = languageOptions.find((option) => option.value === language) || languageOptions[0];
  const passwordToggleLabel = ta(showPassword ? 'login.hidePassword' : 'login.showPassword');

  useEffect(() => {
    if (!isChecking && isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isChecking, navigate]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleLanguageSelect(nextLanguage) {
    setLanguage(nextLanguage);
    setLanguageMenuOpen(false);
  }

  useEffect(() => {
    if (!languageMenuOpen) {
      return undefined;
    }

    const closeOnOutsideClick = (event) => {
      if (languageControlRef.current && !languageControlRef.current.contains(event.target)) {
        setLanguageMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
    };
  }, [languageMenuOpen]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(form);
      navigate('/admin/dashboard', { replace: true });
    } catch {
      setError(ta('login.error'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login-screen" dir={direction} data-text-direction={direction}>
      <section className="admin-login-card">
        <div className="admin-login-card__toolbar">
          <div className="admin-language-control" ref={languageControlRef}>
            <button
              className="admin-login-language"
              type="button"
              onClick={() => setLanguageMenuOpen((open) => !open)}
              aria-label={ta('common.switchLanguage')}
              aria-haspopup="menu"
              aria-expanded={languageMenuOpen}
            >
              <Languages size={16} />
              <span>{currentLanguage.shortLabel}</span>
            </button>
            {languageMenuOpen && (
              <div className="admin-language-menu admin-language-menu--login" role="menu" aria-label={ta('common.switchLanguage')}>
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`admin-language-menu__item ${option.value === language ? 'admin-language-menu__item--active' : ''}`}
                    role="menuitemradio"
                    aria-checked={option.value === language}
                    onClick={() => handleLanguageSelect(option.value)}
                  >
                    <span className="admin-language-menu__code">{option.shortLabel}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="admin-login-card__brand">
          <Logo full />
        </div>

        <div className="admin-login-card__heading">
          <span className="admin-login-icon">
            <LockKeyhole size={24} />
          </span>
          <h1>{ta('login.title')}</h1>
          <small>{ta('login.note')}</small>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            <span>{ta('login.email')}</span>
            <div className="admin-input-shell">
              <Mail className="admin-input-icon" size={18} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                required
                autoComplete="email"
                inputMode="email"
                dir="ltr"
                aria-label={ta('login.email')}
                placeholder={ta('login.emailPlaceholder')}
              />
            </div>
          </label>

          <label>
            <span>{ta('login.password')}</span>
            <div className="admin-input-shell">
              <LockKeyhole className="admin-input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={updateField}
                required
                autoComplete="current-password"
                dir="ltr"
                aria-label={ta('login.password')}
                placeholder={ta('login.passwordPlaceholder')}
              />
              <button
                className="admin-password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={passwordToggleLabel}
                title={passwordToggleLabel}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && (
            <p className="admin-form-error admin-form-error--with-icon">
              <AlertCircle size={17} />
              <span>{error}</span>
            </p>
          )}

          <button className="admin-button admin-button--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="admin-spin-icon" size={17} />}
            <span>{isSubmitting ? ta('common.loading') : ta('login.submit')}</span>
          </button>
        </form>

        <Link className="admin-login-back" to="/">
          <ArrowLeft size={16} />
          <span>{ta('login.back')}</span>
        </Link>
      </section>
    </main>
  );
}
