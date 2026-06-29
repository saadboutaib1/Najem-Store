<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
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
            $total = $subtotal + $deliveryFee;
            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'city' => $data['city'],
                'address' => $data['address'],
                'notes' => $data['notes'] ?? null,
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
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
        $count = Order::query()
            ->where('order_number', 'like', "NS-{$year}-%")
            ->lockForUpdate()
            ->count() + 1;

        return sprintf('NS-%s-%04d', $year, $count);
    }

    private function buildWhatsAppMessage(Order $order): string
    {
        $currency = $this->settings->get('currency', 'د.م.');
        $lines = $order->items->map(function ($item, int $index) use ($currency): string {
            return sprintf(
                "%d. %s\n   الكمية: %d\n   سعر الوحدة: %s %s\n   مجموع المنتج: %s %s",
                $index + 1,
                $item->product_name_ar,
                $item->quantity,
                $item->unit_price,
                $currency,
                $item->total_price,
                $currency
            );
        })->implode("\n\n");

        return "طلب جديد - Najem Store\n"
            ."رقم الطلب: {$order->order_number}\n\n"
            ."معلومات الزبون:\n"
            ."الاسم: {$order->customer_name}\n"
            ."الهاتف: {$order->customer_phone}\n"
            ."المدينة: {$order->city}\n"
            ."العنوان: {$order->address}\n"
            .'الملاحظات: '.($order->notes ?: 'لا توجد ملاحظات')."\n\n"
            ."المنتجات:\n{$lines}\n\n"
            ."ملخص الطلب:\n"
            ."المجموع الفرعي: {$order->subtotal} {$currency}\n"
            ."رسوم التوصيل: {$order->delivery_fee} {$currency}\n"
            ."المجموع الكلي: {$order->total} {$currency}\n\n"
            ."طريقة الدفع:\n"
            .'الدفع عند الاستلام';
    }
}
