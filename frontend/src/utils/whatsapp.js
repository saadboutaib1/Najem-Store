import { STORE_CONFIG } from '../config/store.js';
import { getLocalizedField } from './formatters.js';

function sanitizeWhatsAppNumber(phoneNumber) {
  return phoneNumber.replace(/[^\d]/g, '');
}

export function buildWhatsAppMessage({
  customer,
  items,
  subtotal,
  deliveryFee,
  total,
  language,
}) {
  const isArabic = language === 'ar';
  const productLines = items
    .map((item, index) => {
      const productName = getLocalizedField(item, 'name', language);
      const lineTotal = item.price * item.quantity;

      if (isArabic) {
        return `${index + 1}. ${productName}
   الكمية: ${item.quantity}
   سعر الوحدة: ${item.price} ${STORE_CONFIG.currency}
   مجموع المنتج: ${lineTotal} ${STORE_CONFIG.currency}`;
      }

      return `${index + 1}. ${productName}
   Quantity: ${item.quantity}
   Unit price: ${item.price} ${STORE_CONFIG.currency}
   Line total: ${lineTotal} ${STORE_CONFIG.currency}`;
    })
    .join('\n\n');

  if (isArabic) {
    return `طلب جديد - ${STORE_CONFIG.name}

معلومات الزبون:
الاسم: ${customer.fullName}
الهاتف: ${customer.phone}
المدينة: ${customer.city}
العنوان: ${customer.address}
الملاحظات: ${customer.notes || 'لا توجد ملاحظات'}

المنتجات:
${productLines}

ملخص الطلب:
المجموع الفرعي: ${subtotal} ${STORE_CONFIG.currency}
رسوم التوصيل: ${deliveryFee} ${STORE_CONFIG.currency}
المجموع الكلي: ${total} ${STORE_CONFIG.currency}

طريقة الدفع:
الدفع عند الاستلام`;
  }

  return `New order - ${STORE_CONFIG.name}

Customer information:
Name: ${customer.fullName}
Phone: ${customer.phone}
City: ${customer.city}
Address: ${customer.address}
Notes: ${customer.notes || 'None'}

Products:
${productLines}

Order summary:
Subtotal: ${subtotal} ${STORE_CONFIG.currency}
Delivery fee: ${deliveryFee} ${STORE_CONFIG.currency}
Total: ${total} ${STORE_CONFIG.currency}

Payment method:
Cash on Delivery`;
}

export function createWhatsAppOrderUrl(order) {
  const message = buildWhatsAppMessage(order);
  const phone = sanitizeWhatsAppNumber(STORE_CONFIG.whatsappNumber);

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
