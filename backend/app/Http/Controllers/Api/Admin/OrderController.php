<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\LoyaltyService;
use App\Support\ApiResponse;

class OrderController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly LoyaltyService $loyalty)
    {
    }

    public function index(): mixed
    {
        $orders = Order::query()->with('items')->latest()->get();

        return $this->success(OrderResource::collection($orders)->resolve(), 'Orders loaded.');
    }

    public function show(Order $order): mixed
    {
        return $this->success((new OrderResource($order->load('items')))->resolve(), 'Order loaded.');
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): mixed
    {
        $previousStatus = $order->status;
        $order->update($request->validated());
        $this->loyalty->syncOrderStatus($order->fresh(), $previousStatus);

        return $this->success((new OrderResource($order->fresh('items')))->resolve(), 'Order status updated.');
    }

    public function destroy(Order $order): mixed
    {
        $order->delete();

        return $this->success(null, 'Order deleted.');
    }
}
