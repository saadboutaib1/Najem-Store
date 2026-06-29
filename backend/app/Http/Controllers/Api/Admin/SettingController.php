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
        $this->settings->setMany($data);

        foreach ($socialKeys as $platform) {
            if (array_key_exists($platform, $data) && $data[$platform]) {
                SocialLink::query()->updateOrCreate(
                    ['platform' => $platform],
                    ['url' => $data[$platform], 'status' => 'active']
                );
            }
        }

        if (!empty($data['whatsapp_number'])) {
            $phone = preg_replace('/[^\d]/', '', $data['whatsapp_number']);
            SocialLink::query()->updateOrCreate(
                ['platform' => 'whatsapp'],
                ['url' => "https://wa.me/{$phone}", 'status' => 'active']
            );
        }

        return $this->success($this->settings->all(), 'Settings updated.');
    }
}
