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
            'whatsapp' => ['nullable', 'url'],
            'facebook' => ['nullable', 'url'],
            'instagram' => ['nullable', 'url'],
            'tiktok' => ['nullable', 'url'],
            'youtube' => ['nullable', 'url'],
            'links' => ['nullable', 'array'],
            'links.*.platform' => ['required_with:links', 'string', 'max:80'],
            'links.*.url' => ['required_with:links', 'url'],
            'links.*.status' => ['nullable', 'in:active,inactive'],
        ];
    }
}
