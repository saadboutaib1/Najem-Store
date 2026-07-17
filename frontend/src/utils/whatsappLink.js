export function normalizeWhatsAppNumber(phoneNumber = '') {
  const digits = String(phoneNumber || '').replace(/[^\d]/g, '');

  if (!digits) return '';

  if (digits.startsWith('00')) {
    return digits.slice(2);
  }

  if (digits.length === 10 && digits.startsWith('0')) {
    return `212${digits.slice(1)}`;
  }

  if (digits.length === 9 && !digits.startsWith('212')) {
    return `212${digits}`;
  }

  return digits;
}

export function buildWhatsAppLink(phoneNumber, fallbackNumber = '') {
  const normalizedNumber = normalizeWhatsAppNumber(phoneNumber || fallbackNumber);
  return normalizedNumber ? `https://wa.me/${normalizedNumber}` : '#';
}

export function buildWhatsAppUrl(phoneNumber, message = '', fallbackNumber = '') {
  const baseUrl = buildWhatsAppLink(phoneNumber, fallbackNumber);
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}
