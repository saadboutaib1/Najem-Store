import { STORE_CONFIG } from '../config/store.js';

const currencyAliases = {
  MAD: 'MAD',
  mad: 'MAD',
  'د.م.': 'MAD',
  'د.م': 'MAD',
  درهم: 'MAD',
};

export function normalizeCurrencyCode(currency = STORE_CONFIG.currency) {
  const value = String(currency || STORE_CONFIG.currency).trim();

  if (currencyAliases[value]) {
    return currencyAliases[value];
  }

  return /^[A-Z]{3}$/.test(value) ? value : STORE_CONFIG.currency;
}

export function getCurrencyLabel(language = 'ar', currency = STORE_CONFIG.currency) {
  const currencyCode = normalizeCurrencyCode(currency);

  if (currencyCode === 'MAD') {
    return language === 'ar' ? 'د.م.' : 'MAD';
  }

  return currencyCode;
}

export function formatCurrency(value, language = 'ar', currency = STORE_CONFIG.currency) {
  const amount = Number(value || 0);
  const locale = language === 'ar' ? 'ar-MA' : 'en-MA';

  try {
    const formattedAmount = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(amount);

    return `${formattedAmount} ${getCurrencyLabel(language, currency)}`;
  } catch {
    return `${amount} ${getCurrencyLabel(language, currency)}`;
  }
}

export function getLocalizedField(item, field, language) {
  return item[`${field}_${language}`] || item[`${field}_ar`] || item[`${field}_en`] || '';
}

export function formatStock(stock, language = 'ar') {
  const count = Number(stock || 0);

  if (count <= 0) {
    return language === 'ar' ? 'نفد المخزون' : 'Out of stock';
  }

  try {
    const formattedCount = new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : 'en-MA', {
      maximumFractionDigits: 0,
    }).format(count);

    return language === 'ar' ? `المخزون: ${formattedCount}` : `Stock: ${formattedCount}`;
  } catch {
    return language === 'ar' ? `المخزون: ${count}` : `Stock: ${count}`;
  }
}
