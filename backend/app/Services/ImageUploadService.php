<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ImageUploadService
{
    private const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
    public function store(?UploadedFile $file, string $directory): ?string
    {
        if (!$file) {
            return null;
        }

        $extension = strtolower($file->extension() ?: $file->guessExtension() ?: 'bin');

        if (!in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            throw ValidationException::withMessages([
                'image' => 'The uploaded file type is not supported.',
            ]);
        }

        $filename = Str::uuid().'.'.$extension;

        return $file->storeAs(trim($directory, '/'), $filename, $this->disk());
    }

    public function delete(?string $path): void
    {
        if (!$path || Str::startsWith($path, ['http://', 'https://', '/'])) {
            return;
        }

        Storage::disk($this->disk())->delete($path);
    }

    private function disk(): string
    {
        return config('filesystems.uploads_disk', 'public');
    }
}