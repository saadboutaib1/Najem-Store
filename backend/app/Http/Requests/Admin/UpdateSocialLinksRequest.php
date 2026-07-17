<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSocialLinksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'whatsapp' => ['nullable', 'url', 'max:2048', 'starts_with:http://,https://'],
            'facebook' => ['nullable', 'url', 'max:2048', 'starts_with:http://,https://'],
            'instagram' => ['nullable', 'url', 'max:2048', 'starts_with:http://,https://'],
            'tiktok' => ['nullable', 'url', 'max:2048', 'starts_with:http://,https://'],
            'youtube' => ['nullable', 'url', 'max:2048', 'starts_with:http://,https://'],
            'links' => ['nullable', 'array'],
            'links.*.platform' => ['required_with:links', 'string', 'max:80', 'regex:/^[a-z0-9_-]+$/i'],
            'links.*.url' => ['required_with:links', 'url', 'max:2048', 'starts_with:http://,https://'],
            'links.*.status' => ['nullable', 'in:active,inactive'],
        ];
    }
}
