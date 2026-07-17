import { STORE_CONFIG } from '../config/store.js';
import { formatCurrency, getLocalizedField } from './formatters.js';
import { buildWhatsAppUrl } from './whatsappLink.js';

function formatAmount(value, currency, language) {
  return formatCurrency(value, language, currency || STORE_CONFIG.currency);
}

export function buildWhatsAppMessage({
  orderNumber,
  customer,
  items,
  subtotal,
  deliveryFee,
  discountTotal = 0,
  total,
  language,
  currency = STORE_CONFIG.currency,
}) {
  const isArabic = language === 'ar';
  const isFrench = language === 'fr';
  const productLines = items
    .map((item, index) => {
      const productName = getLocalizedField(item, 'name', language);
      const lineTotal = item.price * item.quantity;

      if (isArabic) {
        return `${index + 1}. ${productName} × ${item.quantity} = ${formatAmount(lineTotal, currency, language)}`;
      }

      return `${index + 1}. ${productName} × ${item.quantity} = ${formatAmount(lineTotal, currency, language)}`;
    })
    .join('\n');

  if (isArabic) {
    return `السلام عليكم، أود إرسال طلب من مغرب العود.

رقم الطلب: ${orderNumber || 'غير متوفر'}

معلومات العميل:
الاسم: ${customer.fullName}
الهاتف: ${customer.phone}
المدينة: ${customer.city}
العنوان: ${customer.address}
ملاحظات: ${customer.notes || 'لا توجد ملاحظات'}

المنتجات:

${productLines}

المجموع الفرعي: ${formatAmount(subtotal, currency, language)}
${discountTotal > 0 ? `خصم عرض اشترِ قطعتين: -${formatAmount(discountTotal, currency, language)}\n` : ''}رسوم التوصيل: ${formatAmount(deliveryFee, currency, language)}
المجموع الكلي: ${formatAmount(total, currency, language)}

طريقة الدفع: الدفع عند الاستلام`;
  }

  if (isFrench) {
    return `Bonjour, je souhaite confirmer une commande depuis MAGHRIB OUD.

Numéro de commande : ${orderNumber || 'N/A'}

Informations client :
Nom : ${customer.fullName}
Téléphone : ${customer.phone}
Ville : ${customer.city}
Adresse : ${customer.address}
Notes : ${customer.notes || 'Aucune'}

Produits :

${productLines}

Sous-total : ${formatAmount(subtotal, currency, language)}
${discountTotal > 0 ? `Réduction « Achetez-en 2 » : -${formatAmount(discountTotal, currency, language)}\n` : ''}Frais de livraison : ${formatAmount(deliveryFee, currency, language)}
Total : ${formatAmount(total, currency, language)}

Mode de paiement : Paiement à la livraison`;
  }

  return `Hello, I would like to confirm an order from MAGHRIB OUD.

Order number: ${orderNumber || 'N/A'}

Customer information:
Name: ${customer.fullName}
Phone: ${customer.phone}
City: ${customer.city}
Address: ${customer.address}
Notes: ${customer.notes || 'None'}

Products:

${productLines}

Subtotal: ${formatAmount(subtotal, currency, language)}
${discountTotal > 0 ? `Buy 2 offer discount: -${formatAmount(discountTotal, currency, language)}\n` : ''}Delivery fee: ${formatAmount(deliveryFee, currency, language)}
Total: ${formatAmount(total, currency, language)}

Payment method: Cash on delivery`;
}

export function createWhatsAppOrderUrl(order) {
  const message = buildWhatsAppMessage(order);
  return buildWhatsAppUrl(order.whatsappNumber, message, STORE_CONFIG.whatsappNumber);
}
