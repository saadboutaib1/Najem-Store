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
            'whatsapp_number' => ['nullable', 'string', 'max:40'],
            'currency' => ['nullable', 'string', 'max:20'],
            'delivery_fee' => ['nullable', 'numeric', 'min:0'],
            'default_language' => ['nullable', Rule::in(['ar', 'en'])],
            'payment_method' => ['nullable', Rule::in(['cash_on_delivery'])],
            'country' => ['nullable', 'string', 'max:120'],
            'facebook' => ['nullable', 'url'],
            'instagram' => ['nullable', 'url'],
            'tiktok' => ['nullable', 'url'],
            'youtube' => ['nullable', 'url'],
        ];
    }
}
