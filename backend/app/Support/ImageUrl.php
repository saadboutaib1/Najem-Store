<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUrl
{
    public static function resolve(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        if (Str::startsWith($path, '/')) {
            return rtrim(config('app.frontend_url'), '/').$path;
        }

        return Storage::disk(config('filesystems.uploads_disk', 'public'))->url($path);
    }
}