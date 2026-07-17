<?php

use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\Admin\SocialLinkController as AdminSocialLinkController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Api\Public\LoyaltyController as PublicLoyaltyController;
use App\Http\Controllers\Api\Public\OrderController as PublicOrderController;
use App\Http\Controllers\Api\Public\ProductController as PublicProductController;
use App\Http\Controllers\Api\Public\SettingController as PublicSettingController;
use App\Http\Controllers\Api\Public\SocialLinkController as PublicSocialLinkController;
use Illuminate\Support\Facades\Route;

Route::get('health', HealthController::class);

Route::middleware('throttle:120,1')->group(function (): void {
    Route::get('categories', [PublicCategoryController::class, 'index']);
    Route::get('categories/{slug}', [PublicCategoryController::class, 'show']);

    Route::get('products', [PublicProductController::class, 'index']);
    Route::get('products/featured', [PublicProductController::class, 'featured']);
    Route::get('products/slug/{slug}', [PublicProductController::class, 'showBySlug']);
    Route::get('products/{id}', [PublicProductController::class, 'show'])->whereNumber('id');

    Route::get('settings', [PublicSettingController::class, 'index']);
    Route::get('social-links', [PublicSocialLinkController::class, 'index']);
});

Route::get('loyalty-points', [PublicLoyaltyController::class, 'show'])->middleware('throttle:30,1');
Route::post('orders', [PublicOrderController::class, 'store'])->middleware('throttle:10,1');

Route::prefix('admin')->group(function (): void {
    Route::post('login', [AdminAuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware(['auth:sanctum', 'admin.active', 'throttle:120,1'])->group(function (): void {
        Route::post('logout', [AdminAuthController::class, 'logout']);
        Route::get('profile', [AdminAuthController::class, 'profile']);
        Route::put('profile', [AdminAuthController::class, 'updateProfile']);
        Route::put('change-password', [AdminAuthController::class, 'changePassword'])->middleware('throttle:10,1');

        Route::get('dashboard', [AdminDashboardController::class, 'index']);

        Route::apiResource('categories', AdminCategoryController::class)->except(['show']);
        Route::apiResource('products', AdminProductController::class);

        Route::get('orders', [AdminOrderController::class, 'index']);
        Route::get('orders/{order}', [AdminOrderController::class, 'show']);
        Route::put('orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
        Route::delete('orders/{order}', [AdminOrderController::class, 'destroy']);

        Route::get('settings', [AdminSettingController::class, 'index']);
        Route::put('settings', [AdminSettingController::class, 'update']);

        Route::get('social-links', [AdminSocialLinkController::class, 'index']);
        Route::put('social-links', [AdminSocialLinkController::class, 'update']);
    });
});