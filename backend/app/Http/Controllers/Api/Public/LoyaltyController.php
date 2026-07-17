<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\LoyaltyService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly LoyaltyService $loyalty)
    {
    }

    public function show(Request $request): mixed
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:40', 'regex:/^[0-9+\\s().-]{8,40}$/'],
        ]);

        return $this->success($this->loyalty->lookup($data['phone']), 'Loyalty points loaded.');
    }
}
