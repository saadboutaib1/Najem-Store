import { STORE_CONFIG } from '../config/store.js';

export function formatCurrency(value, language = 'ar') {
  try {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : 'en-MA', {
      style: 'currency',
      currency: STORE_CONFIG.currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} ${STORE_CONFIG.currency}`;
  }
}

export function getLocalizedField(item, field, language) {
  return item[`${field}_${language}`] || item[`${field}_ar`] || item[`${field}_en`] || '';
}
