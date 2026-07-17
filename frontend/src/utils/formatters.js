import { STORE_CONFIG } from '../config/store.js';

const currencyAliases = {
  MAD: 'MAD',
  mad: 'MAD',
  'د.م.': 'MAD',
  'د.م': 'MAD',
  درهم: 'MAD',
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
  const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-MA';

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
  if (item[`${field}_${language}`]) {
    return item[`${field}_${language}`];
  }

  if (language === 'ar') {
    return item[`${field}_ar`] || item[`${field}_en`] || '';
  }

  return item[`${field}_en`] || item[`${field}_ar`] || '';
}

export function formatStock(stock, language = 'ar') {
  const count = Number(stock || 0);

  if (count <= 0) {
    if (language === 'ar') {
      return 'نفد المخزون';
    }

    return language === 'fr' ? 'Rupture de stock' : 'Out of stock';
  }

  try {
    const formattedCount = new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-MA', {
      maximumFractionDigits: 0,
    }).format(count);

    if (language === 'ar') {
      return `المخزون: ${formattedCount}`;
    }

    return language === 'fr' ? `Stock : ${formattedCount}` : `Stock: ${formattedCount}`;
  } catch {
    if (language === 'ar') {
      return `المخزون: ${count}`;
    }

    return language === 'fr' ? `Stock : ${count}` : `Stock: ${count}`;
  }
}
