<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\SocialLink;
use App\Services\SettingsService;
use App\Support\ApiResponse;

class SettingController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly SettingsService $settings)
    {
    }

    public function index(): mixed
    {
        return $this->success([
            'settings' => $this->settings->all(),
            'social_links' => SocialLink::query()->orderBy('id')->get(['platform', 'url', 'status']),
        ], 'Settings loaded.');
    }

    public function update(UpdateSettingsRequest $request): mixed
    {
        $data = $request->validated();
        $socialKeys = ['facebook', 'instagram', 'tiktok', 'youtube'];
        $normalizedWhatsAppNumber = null;

        if (!empty($data['whatsapp_number'])) {
            $normalizedWhatsAppNumber = $this->normalizeWhatsAppNumber($data['whatsapp_number']);
            $data['whatsapp_number'] = $normalizedWhatsAppNumber ? "+{$normalizedWhatsAppNumber}" : $data['whatsapp_number'];
        }

        $this->settings->setMany($data);

        foreach ($socialKeys as $platform) {
            if (array_key_exists($platform, $data) && $data[$platform]) {
                SocialLink::query()->updateOrCreate(
                    ['platform' => $platform],
                    ['url' => $data[$platform], 'status' => 'active']
                );
            }
        }

        if ($normalizedWhatsAppNumber) {
            SocialLink::query()->updateOrCreate(
                ['platform' => 'whatsapp'],
                ['url' => "https://wa.me/{$normalizedWhatsAppNumber}", 'status' => 'active']
            );
        }

        return $this->success($this->settings->all(), 'Settings updated.');
    }

    private function normalizeWhatsAppNumber(string $phoneNumber): string
    {
        $digits = preg_replace('/[^\d]/', '', $phoneNumber) ?? '';

        if (str_starts_with($digits, '00')) {
            return substr($digits, 2);
        }

        if (strlen($digits) === 10 && str_starts_with($digits, '0')) {
            return '212' . substr($digits, 1);
        }

        if (strlen($digits) === 9 && !str_starts_with($digits, '212')) {
            return '212' . $digits;
        }

        return $digits;
    }
}
