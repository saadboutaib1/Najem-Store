<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(private readonly SettingsService $settings)
    {
    }

    public function create(array $data): Order
    {
        return DB::transaction(function () use ($data): Order {
            $subtotal = 0;
            $resolvedItems = [];

            foreach ($data['items'] as $item) {
                $product = $this->resolveProduct($item);
                $quantity = (int) $item['quantity'];

                if ($product->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => "Insufficient stock for {$product->name_en}.",
                    ]);
                }

                $lineTotal = (float) $product->price * $quantity;
                $subtotal += $lineTotal;

                $resolvedItems[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'unit_price' => (float) $product->price,
                    'total_price' => $lineTotal,
                ];
            }

            $deliveryFee = $this->settings->getFloat('delivery_fee', 30);
            $discountTotal = $this->calculateBuy2Discount($resolvedItems);
            $total = max(0, $subtotal - $discountTotal) + $deliveryFee;
            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'city' => $data['city'],
                'address' => $data['address'],
                'notes' => $data['notes'] ?? null,
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'discount_total' => $discountTotal,
                'total' => $total,
                'payment_method' => 'cash_on_delivery',
                'status' => 'pending',
            ]);

            foreach ($resolvedItems as $resolvedItem) {
                $product = $resolvedItem['product'];

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name_ar' => $product->name_ar,
                    'product_name_en' => $product->name_en,
                    'product_name_fr' => $product->name_fr ?: $product->name_en,
                    'quantity' => $resolvedItem['quantity'],
                    'unit_price' => $resolvedItem['unit_price'],
                    'total_price' => $resolvedItem['total_price'],
                ]);

                $product->decrement('stock', $resolvedItem['quantity']);
            }

            $order->update([
                'whatsapp_message' => $this->buildWhatsAppMessage($order->fresh(['items'])),
            ]);

            return $order->fresh(['items']);
        });
    }

    private function resolveProduct(array $item): Product
    {
        $identifier = $item['product_id'] ?? $item['id'] ?? null;
        $slug = $item['slug'] ?? null;

        $query = Product::query()->where('status', 'active')->lockForUpdate();

        if ($slug) {
            $product = (clone $query)->where('slug', $slug)->first();
        } elseif (is_numeric($identifier)) {
            $product = (clone $query)->whereKey((int) $identifier)->first();
        } else {
            $product = (clone $query)->where('slug', (string) $identifier)->first();
        }

        if (!$product) {
            throw ValidationException::withMessages([
                'items' => 'One or more products were not found.',
            ]);
        }

        return $product;
    }

    private function generateOrderNumber(): string
    {
        $year = now()->format('Y');
        $prefix = "NS-{$year}-";
        $maxSequence = Order::query()
            ->where('order_number', 'like', "NS-{$year}-%")
            ->lockForUpdate()
            ->pluck('order_number')
            ->map(function (string $orderNumber) use ($prefix): int {
                return (int) str_replace($prefix, '', $orderNumber);
            })
            ->max() ?? 0;

        $nextSequence = $maxSequence + 1;

        do {
            $orderNumber = sprintf('NS-%s-%04d', $year, $nextSequence);
            $nextSequence++;
        } while (Order::query()->where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    private function calculateBuy2Discount(array $resolvedItems): float
    {
        if (!$this->isBuy2OfferActive()) {
            return 0;
        }

        $type = $this->settings->get('buy2_discount_type', 'percentage');
        $value = max(0, $this->settings->getFloat('buy2_discount_value', 10));
        $discount = 0;

        foreach ($resolvedItems as $item) {
            if ((int) $item['quantity'] < 2) {
                continue;
            }

            $lineTotal = (float) $item['total_price'];

            if ($type === 'fixed') {
                $discount += min($lineTotal, $value);
            } else {
                $discount += $lineTotal * min($value, 100) / 100;
            }
        }

        return round(min($discount, array_sum(array_column($resolvedItems, 'total_price'))), 2);
    }

    private function isBuy2OfferActive(): bool
    {
        $enabled = filter_var($this->settings->get('buy2_offer_enabled', '0'), FILTER_VALIDATE_BOOLEAN);

        if (!$enabled) {
            return false;
        }

        $now = now();
        $startsAt = $this->settings->get('buy2_offer_starts_at');
        $endsAt = $this->settings->get('buy2_offer_ends_at');

        if ($startsAt && $now->lt(Carbon::parse($startsAt))) {
            return false;
        }

        if ($endsAt && $now->gt(Carbon::parse($endsAt))) {
            return false;
        }

        return true;
    }

    private function buildWhatsAppMessage(Order $order): string
    {
        $currency = $this->settings->get('currency', 'د.م.');
        $lines = $order->items->map(function ($item, int $index) use ($currency): string {
            return sprintf(
                "%d. %s\n   الكمية: %d\n   سعر الوحدة: %s %s\n   إجمالي المنتج: %s %s",
                $index + 1,
                $item->product_name_ar,
                $item->quantity,
                $item->unit_price,
                $currency,
                $item->total_price,
                $currency
            );
        })->implode("\n\n");

        return "طلب جديد - مغرب العود\n"
            ."رقم الطلب: {$order->order_number}\n\n"
            ."معلومات العميل:\n"
            ."الاسم: {$order->customer_name}\n"
            ."الهاتف: {$order->customer_phone}\n"
            ."المدينة: {$order->city}\n"
            ."العنوان: {$order->address}\n"
            .'الملاحظات: '.($order->notes ?: 'لا توجد ملاحظات')."\n\n"
            ."المنتجات:\n{$lines}\n\n"
            ."ملخص الطلب:\n"
            ."المجموع الفرعي: {$order->subtotal} {$currency}\n"
            .(((float) $order->discount_total > 0) ? "خصم عرض اشترِ قطعتين: -{$order->discount_total} {$currency}\n" : '')
            ."رسوم التوصيل: {$order->delivery_fee} {$currency}\n"
            ."المجموع الكلي: {$order->total} {$currency}\n\n"
            ."طريقة الدفع:\n"
            .'الدفع عند الاستلام';
    }
}
