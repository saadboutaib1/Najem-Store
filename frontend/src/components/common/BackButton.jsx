import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function BackButton({ fallbackTo = '/', label, className = '' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { direction, t } = useLanguage();
  const ArrowIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;
  const buttonLabel = label || t('common.back');

  const handleClick = () => {
    if (location.key && location.key !== 'default') {
      navigate(-1);
      return;
    }

    navigate(fallbackTo);
  };

  return (
    <button type="button" className={`back-button ${className}`.trim()} onClick={handleClick}>
      <ArrowIcon size={18} aria-hidden="true" />
      {buttonLabel}
    </button>
  );
}
