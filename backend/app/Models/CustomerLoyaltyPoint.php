<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerLoyaltyPoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'phone',
        'customer_name',
        'total_points',
        'total_orders',
        'last_order_at',
    ];

    protected function casts(): array
    {
        return [
            'total_points' => 'integer',
            'total_orders' => 'integer',
            'last_order_at' => 'datetime',
        ];
    }
}
