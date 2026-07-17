<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_name' => ['nullable', 'string', 'max:255'],
            'whatsapp_number' => ['nullable', 'string', 'max:40', 'regex:/^[0-9+\\s().-]{8,40}$/'],
            'currency' => ['nullable', 'string', 'max:20'],
            'delivery_fee' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'default_language' => ['nullable', Rule::in(['ar', 'fr', 'en'])],
            'payment_method' => ['nullable', Rule::in(['cash_on_delivery'])],
            'country' => ['nullable', 'string', 'max:120'],
            'facebook' => ['nullable', 'url', 'max:2048', 'starts_with:http://,https://'],
            'instagram' => ['nullable', 'url', 'max:2048', 'starts_with:http://,https://'],
            'tiktok' => ['nullable', 'url', 'max:2048', 'starts_with:http://,https://'],
            'youtube' => ['nullable', 'url', 'max:2048', 'starts_with:http://,https://'],
            'buy2_offer_enabled' => ['nullable', 'boolean'],
            'buy2_offer_starts_at' => ['nullable', 'date'],
            'buy2_offer_ends_at' => ['nullable', 'date', 'after_or_equal:buy2_offer_starts_at'],
            'buy2_discount_type' => ['nullable', Rule::in(['percentage', 'fixed'])],
            'buy2_discount_value' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'loyalty_points_enabled' => ['nullable', 'boolean'],
            'loyalty_amount_per_point' => ['nullable', 'numeric', 'min:1', 'max:100000'],
            'loyalty_reward_points' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'loyalty_reward_value' => ['nullable', 'numeric', 'min:0', 'max:10000'],
        ];
    }
}
