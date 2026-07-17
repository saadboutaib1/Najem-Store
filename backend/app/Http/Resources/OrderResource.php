<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'city' => $this->city,
            'address' => $this->address,
            'notes' => $this->notes,
            'subtotal' => (float) $this->subtotal,
            'delivery_fee' => (float) $this->delivery_fee,
            'discount_total' => (float) $this->discount_total,
            'total' => (float) $this->total,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'whatsapp_message' => $this->whatsapp_message,
            'loyalty_points_earned' => (int) $this->loyalty_points_earned,
            'loyalty_points_awarded_at' => $this->loyalty_points_awarded_at?->toISOString(),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
