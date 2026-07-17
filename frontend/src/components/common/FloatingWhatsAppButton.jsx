import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStoreData } from '../../context/StoreDataContext.jsx';

export default function FloatingWhatsAppButton() {
  const { t } = useLanguage();
  const { getWhatsAppUrl } = useStoreData();
  const label = t('common.whatsappChat');

  return (
    <a
      className="floating-whatsapp"
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
    >
      <span className="floating-whatsapp__icon" aria-hidden="true">
        <MessageCircle size={22} />
      </span>
      <span className="floating-whatsapp__text">{t('common.whatsappShort')}</span>
    </a>
  );
}
