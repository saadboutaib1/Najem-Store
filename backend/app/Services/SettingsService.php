<?php

namespace App\Services;

use App\Models\Setting;

class SettingsService
{
    public function all(): array
    {
        return Setting::query()
            ->orderBy('key')
            ->pluck('value', 'key')
            ->toArray();
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return Setting::query()->where('key', $key)->value('value') ?? $default;
    }

    public function getFloat(string $key, float $default = 0): float
    {
        return (float) $this->get($key, $default);
    }

    public function setMany(array $values): void
    {
        foreach ($values as $key => $value) {
            Setting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
