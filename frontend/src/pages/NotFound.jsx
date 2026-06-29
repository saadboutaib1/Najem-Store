import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <section className="page-section">
      <div className="container empty-panel">
        <span className="not-found-code">404</span>
        <h1>{t('notFound.title')}</h1>
        <p>{t('notFound.text')}</p>
        <Link to="/" className="button button--gold">
          <Home size={18} aria-hidden="true" />
          {t('notFound.action')}
        </Link>
      </div>
    </section>
  );
}
