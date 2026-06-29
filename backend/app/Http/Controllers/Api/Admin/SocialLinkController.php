<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSocialLinksRequest;
use App\Http\Resources\SocialLinkResource;
use App\Models\SocialLink;
use App\Support\ApiResponse;

class SocialLinkController extends Controller
{
    use ApiResponse;

    public function index(): mixed
    {
        $links = SocialLink::query()->orderBy('id')->get();

        return $this->success(SocialLinkResource::collection($links)->resolve(), 'Social links loaded.');
    }

    public function update(UpdateSocialLinksRequest $request): mixed
    {
        $data = $request->validated();

        foreach (['whatsapp', 'facebook', 'instagram', 'tiktok', 'youtube'] as $platform) {
            if (!empty($data[$platform])) {
                SocialLink::query()->updateOrCreate(
                    ['platform' => $platform],
                    ['url' => $data[$platform], 'status' => 'active']
                );
            }
        }

        foreach ($data['links'] ?? [] as $link) {
            SocialLink::query()->updateOrCreate(
                ['platform' => $link['platform']],
                ['url' => $link['url'], 'status' => $link['status'] ?? 'active']
            );
        }

        $links = SocialLink::query()->orderBy('id')->get();

        return $this->success(SocialLinkResource::collection($links)->resolve(), 'Social links updated.');
    }
}
