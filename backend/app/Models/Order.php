<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    public const STATUSES = [
        'pending',
        'confirmed',
        'preparing',
        'shipped',
        'delivered',
        'cancelled',
    ];

    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_phone',
        'city',
        'address',
        'notes',
        'subtotal',
        'delivery_fee',
        'total',
        'payment_method',
        'status',
        'whatsapp_message',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
