<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\SocialLinkResource;
use App\Models\SocialLink;
use App\Support\ApiResponse;

class SocialLinkController extends Controller
{
    use ApiResponse;

    public function index(): mixed
    {
        $links = SocialLink::query()
            ->where('status', 'active')
            ->orderBy('id')
            ->get();

        return $this->success(SocialLinkResource::collection($links)->resolve(), 'Social links loaded.');
    }
}
