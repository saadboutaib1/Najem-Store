# WhatsApp Checkout Flow - MAGHRIB OUD

## 1. Purpose

MAGHRIB OUD does not use online payment in Version 1. Orders are sent to WhatsApp Business, and payment is Cash on Delivery.

The checkout flow must create a clean, complete, readable WhatsApp message so the store can confirm the order manually.

## 2. Required Customer Fields

- Customer name
- Phone number
- City
- Address

## 3. Required Cart Fields

For each selected product:

- Product name
- Quantity
- Unit price
- Line total

## 4. Required Totals

- Subtotal
- Delivery fee if available
- Total price
- Currency
- Payment method: Cash on Delivery

## 5. Checkout Steps

1. Customer adds products to cart.
2. Customer opens cart and reviews quantities.
3. Customer continues to checkout.
4. Customer fills in name, phone, city, and address.
5. App validates required fields.
6. App calculates subtotal.
7. App gets delivery fee by city if configured.
8. App calculates total.
9. App generates WhatsApp message.
10. App URL-encodes the message.
11. App opens WhatsApp Business link:

```text
https://wa.me/{WHATSAPP_BUSINESS_NUMBER}?text={ENCODED_MESSAGE}
```

## 6. Message Template

```text
طلب جديد - MAGHRIB OUD

معلومات الزبون:
الاسم: {customerName}
الهاتف: {phone}
المدينة: {city}
العنوان: {address}

المنتجات:
1. {productName}
   الكمية: {quantity}
   ثمن الوحدة: {unitPrice} {currency}
   المجموع: {lineTotal} {currency}

ملخص الطلب:
المجموع الفرعي: {subtotal} {currency}
رسوم التوصيل: {deliveryFeeText}
المجموع الكلي: {total} {currency}

طريقة الدفع:
Cash on Delivery
```

If delivery fee is unavailable, use:

```text
رسوم التوصيل: يتم تأكيدها عبر واتساب
```

## 7. Example Message

```text
طلب جديد - MAGHRIB OUD

معلومات الزبون:
الاسم: محمد أمين
الهاتف: 0612345678
المدينة: Casablanca
العنوان: شارع الحسن الثاني، رقم 12

المنتجات:
1. عود فاخر
   الكمية: 2
   ثمن الوحدة: 250 MAD
   المجموع: 500 MAD

2. بخور ملكي
   الكمية: 1
   ثمن الوحدة: 120 MAD
   المجموع: 120 MAD

ملخص الطلب:
المجموع الفرعي: 620 MAD
رسوم التوصيل: 30 MAD
المجموع الكلي: 650 MAD

طريقة الدفع:
Cash on Delivery
```

## 8. Frontend Logic

The frontend should expose a helper that:

1. Receives customer, cart, totals, and store WhatsApp number.
2. Builds the text message.
3. Encodes the message using `encodeURIComponent`.
4. Returns the final `wa.me` URL.

Pseudo-flow:

```text
subtotal = sum(item.quantity * item.unitPrice)
deliveryFee = getDeliveryFee(city)
total = subtotal + deliveryFee if deliveryFee exists
message = buildWhatsAppMessage(customer, items, subtotal, deliveryFee, total)
url = "https://wa.me/" + businessNumber + "?text=" + encodeURIComponent(message)
open(url)
```

## 9. Backend Logic

The backend can support checkout in two levels:

### Simple Version

- Frontend generates the WhatsApp message.
- Backend is only used for products and delivery fee.

### Stronger Version

- Frontend sends cart and customer details to backend.
- Backend validates product prices and stock.
- Backend creates a pending order.
- Backend returns the WhatsApp message and URL.
- Admin can see pending orders even before manual WhatsApp confirmation.

## 10. Validation Rules

- Customer name is required.
- Phone number is required.
- City is required.
- Address is required.
- Cart cannot be empty.
- Quantity must be at least 1.
- Product must be active.
- Price should come from trusted backend data when backend checkout is enabled.

## 11. Edge Cases

- Product out of stock: prevent checkout or show confirmation warning.
- Delivery fee unavailable: message should say it will be confirmed through WhatsApp.
- WhatsApp number missing: disable checkout button and show admin configuration error.
- User has no WhatsApp installed: web WhatsApp should still open in browser when possible.

## 12. Privacy Notes

- Customer personal data should only be collected for order fulfillment.
- If orders are stored, the privacy policy should explain retention and usage.
- Avoid storing WhatsApp message text longer than needed unless used for admin audit.
