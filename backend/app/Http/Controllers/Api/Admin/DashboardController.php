<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Support\ApiResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    public function index(): mixed
    {
        return $this->success([
            'total_products' => Product::query()->count(),
            'total_categories' => Category::query()->count(),
            'total_orders' => Order::query()->count(),
            'pending_orders' => Order::query()->where('status', 'pending')->count(),
            'delivered_orders' => Order::query()->where('status', 'delivered')->count(),
            'total_revenue' => (float) Order::query()->where('status', 'delivered')->sum('total'),
        ], 'Dashboard loaded.');
    }
}
