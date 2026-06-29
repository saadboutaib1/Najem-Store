<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
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
        return $this->success($this->settings->all(), 'Settings loaded.');
    }
}
