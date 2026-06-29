<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiSmokeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_public_catalog_and_order_endpoints_work(): void
    {
        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(4, 'data');

        $this->getJson('/api/products?category=oud')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data' => [[
                'id',
                'name_ar',
                'name_en',
                'slug',
                'category',
                'category_slug',
                'description_ar',
                'description_en',
                'price',
                'oldPrice',
                'stock',
                'image',
                'rating',
                'isFeatured',
                'status',
            ]]]);

        $this->getJson('/api/products/featured')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.store_name', 'Najem Store');

        $this->getJson('/api/social-links')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(5, 'data');

        $product = Product::where('slug', 'oud-royal')->firstOrFail();
        $stockBeforeOrder = $product->stock;

        $this->postJson('/api/orders', [
            'customer_name' => 'Test Customer',
            'customer_phone' => '+212600000001',
            'city' => 'Casablanca',
            'address' => 'Test address',
            'notes' => 'Smoke test',
            'items' => [
                ['slug' => 'oud-royal', 'quantity' => 1],
            ],
        ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('whatsapp_message_ready', true)
            ->assertJsonStructure(['order_number', 'data' => ['items']]);

        $this->assertSame($stockBeforeOrder - 1, $product->refresh()->stock);

        $this->postJson('/api/orders', [])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['errors']);
    }

    public function test_admin_login_and_dashboard_work(): void
    {
        $this->get('/api/admin/dashboard')
            ->assertUnauthorized()
            ->assertJsonPath('success', false);

        $login = $this->postJson('/api/admin/login', [
            'email' => 'admin@najemstore.com',
            'password' => 'password123',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['admin', 'token']]);

        $token = $login->json('data.token');

        $this->withToken($token)
            ->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => [
                'total_products',
                'total_categories',
                'total_orders',
                'pending_orders',
                'delivered_orders',
                'total_revenue',
            ]]);
    }

    public function test_admin_order_status_and_security_errors_work(): void
    {
        $token = $this->postJson('/api/admin/login', [
            'email' => 'admin@najemstore.com',
            'password' => 'password123',
        ])->json('data.token');

        $order = $this->postJson('/api/orders', [
            'customer_name' => 'Ali Test',
            'customer_phone' => '0600000000',
            'city' => 'Settat',
            'address' => 'Hay Salam, Settat',
            'notes' => 'Test order from backend validation',
            'items' => [
                ['product_id' => 1, 'quantity' => 1],
            ],
        ])
            ->assertCreated()
            ->assertJsonPath('success', true);

        $this->withToken($token)
            ->getJson('/api/admin/orders')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->withToken($token)
            ->putJson('/api/admin/orders/'.$order->json('data.id').'/status', [
                'status' => 'confirmed',
            ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'confirmed');

        $this->postJson('/api/admin/login', [
            'email' => 'wrong@test.com',
            'password' => 'wrong',
        ])
            ->assertUnauthorized()
            ->assertJsonPath('success', false);

        $this->withToken($token)
            ->putJson('/api/admin/change-password', [
                'current_password' => 'wrong-password',
                'password' => 'newPassword123',
                'password_confirmation' => 'newPassword123',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false);
    }
}
