<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminLoginRequest;
use App\Http\Requests\Admin\ChangePasswordRequest;
use App\Http\Requests\Admin\UpdateProfileRequest;
use App\Http\Resources\AdminResource;
use App\Models\Admin;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function login(AdminLoginRequest $request): mixed
    {
        $admin = Admin::query()->where('email', $request->validated('email'))->first();

        if (!$admin || !Hash::check($request->validated('password'), $admin->password)) {
            return $this->error('Invalid credentials.', 401);
        }

        if (!$admin->isActive()) {
            return $this->error('Admin account is inactive.', 403);
        }

        $token = $admin->createToken('admin-api')->plainTextToken;

        return $this->success([
            'admin' => (new AdminResource($admin))->resolve(),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Logged in.');
    }

    public function logout(): mixed
    {
        request()->user()?->currentAccessToken()?->delete();

        return $this->success(null, 'Logged out.');
    }

    public function profile(): mixed
    {
        return $this->success((new AdminResource(request()->user()))->resolve(), 'Profile loaded.');
    }

    public function updateProfile(UpdateProfileRequest $request): mixed
    {
        $admin = $request->user();
        $admin->update($request->validated());

        return $this->success((new AdminResource($admin->fresh()))->resolve(), 'Profile updated.');
    }

    public function changePassword(ChangePasswordRequest $request): mixed
    {
        $admin = $request->user();

        if (!Hash::check($request->validated('current_password'), $admin->password)) {
            return $this->error('Current password is incorrect.', 422, [
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $admin->update(['password' => $request->validated('password')]);
        $admin->tokens()->delete();

        return $this->success(null, 'Password changed. Please log in again.');
    }
}
