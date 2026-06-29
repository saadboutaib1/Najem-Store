<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use App\Support\ApiResponse;

class OrderController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly OrderService $orders)
    {
    }

    public function store(StoreOrderRequest $request): mixed
    {
        $order = $this->orders->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Order created.',
            'order_number' => $order->order_number,
            'data' => (new OrderResource($order->load('items')))->resolve(),
            'whatsapp_message_ready' => true,
        ], 201);
    }
}
