export function isValidPhoneNumber(value) {
  const digits = String(value || '').replace(/[^\d]/g, '');

  return digits.length >= 9 && digits.length <= 15;
}
