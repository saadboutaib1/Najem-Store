<?php

namespace Tests\Feature;

use App\Models\CustomerLoyaltyPoint;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
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

    public function test_health_endpoint_returns_safe_status(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertExactJson(['status' => 'ok']);
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
                'name_fr',
                'slug',
                'category',
                'category_slug',
                'category_name_fr',
                'description_ar',
                'description_en',
                'description_fr',
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
            ->assertJsonPath('data.store_name', 'MAGHRIB OUD')
            ->assertJsonPath('data.currency', 'د.م.');

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
            'email' => 'admin@maghriboud.com',
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

        $this->withToken($token)
            ->putJson('/api/admin/products/1', ['remove_image' => true])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.image', null)
            ->assertJsonPath('data.main_image', null);

        $this->withToken($token)
            ->putJson('/api/admin/categories/1', ['remove_image' => true])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.image', null);
    }

    public function test_admin_order_status_and_security_errors_work(): void
    {
        $token = $this->postJson('/api/admin/login', [
            'email' => 'admin@maghriboud.com',
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
    public function test_order_security_rejects_bad_quantities_and_recalculates_totals(): void
    {
        $product = Product::where('slug', 'oud-royal')->firstOrFail();

        $this->postJson('/api/orders', [
            'customer_name' => 'Security Customer',
            'customer_phone' => '+212600000002',
            'city' => 'Casablanca',
            'address' => 'Security test address',
            'items' => [
                ['product_id' => $product->id, 'quantity' => -1],
            ],
        ])->assertUnprocessable();

        $this->postJson('/api/orders', [
            'customer_name' => 'Security Customer',
            'customer_phone' => '+212600000002',
            'city' => 'Casablanca',
            'address' => 'Security test address',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 100],
            ],
        ])->assertUnprocessable();

        $response = $this->postJson('/api/orders', [
            'customer_name' => 'Security Customer',
            'customer_phone' => '+212600000002',
            'city' => 'Casablanca',
            'address' => 'Security test address',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'price' => 1,
                    'total' => 2,
                ],
            ],
        ])->assertCreated();

        $this->assertSame((float) $product->price * 2, (float) $response->json('data.subtotal'));
    }

    public function test_loyalty_lookup_does_not_expose_unused_personal_fields(): void
    {
        CustomerLoyaltyPoint::query()->create([
            'phone' => '212600000003',
            'customer_name' => 'Private Customer',
            'total_points' => 75,
            'total_orders' => 2,
            'last_order_at' => now(),
        ]);

        $response = $this->getJson('/api/loyalty-points?phone=0600000003')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertArrayNotHasKey('customer_name', $response->json('data'));
        $this->assertArrayNotHasKey('last_order_at', $response->json('data'));
    }
    public function test_admin_routes_reject_non_admin_tokens(): void
    {
        $user = User::factory()->create();
        $plainToken = Str::random(40);

        PersonalAccessToken::query()->forceCreate([
            'tokenable_type' => User::class,
            'tokenable_id' => $user->id,
            'name' => 'public-user-test',
            'token' => hash('sha256', $plainToken),
            'abilities' => ['*'],
        ]);

        $this->withToken($plainToken)
            ->getJson('/api/admin/dashboard')
            ->assertUnauthorized()
            ->assertJsonPath('success', false);
    }

    public function test_admin_upload_validation_rejects_unsafe_files(): void
    {
        $token = $this->adminTokenForTests();
        $payload = [
            'name_ar' => 'اختبار',
            'name_en' => 'Security Test',
            'name_fr' => 'Test de sécurité',
            'description_ar' => 'اختبار',
            'description_en' => 'Security test',
            'description_fr' => 'Test de sécurité',
            'sort_order' => 99,
            'status' => 'active',
        ];

        $this->withToken($token)
            ->withHeader('Accept', 'application/json')
            ->post('/api/admin/categories', $payload + [
                'image' => UploadedFile::fake()->create('payload.svg', 10, 'image/svg+xml'),
            ])
            ->assertUnprocessable();

        $this->withToken($token)
            ->withHeader('Accept', 'application/json')
            ->post('/api/admin/categories', $payload + [
                'slug' => 'oversized-security-test',
                'image' => UploadedFile::fake()->create('large.jpg', 5000, 'image/jpeg'),
            ])
            ->assertUnprocessable();
    }

    public function test_security_headers_and_cors_are_restrictive(): void
    {
        $response = $this->getJson('/api/health')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY');

        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));

        $this->withHeaders(['Origin' => 'https://evil.example'])
            ->options('/api/health')
            ->assertHeaderMissing('Access-Control-Allow-Origin');
    }

    public function test_admin_login_rate_limit_is_enforced(): void
    {
        $clientIp = '203.0.113.77';

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => $clientIp])
                ->postJson('/api/admin/login', [
                    'email' => 'rate-limit@example.com',
                    'password' => 'wrong-password',
                ])
                ->assertUnauthorized();
        }

        $this->withServerVariables(['REMOTE_ADDR' => $clientIp])
            ->postJson('/api/admin/login', [
                'email' => 'rate-limit@example.com',
                'password' => 'wrong-password',
            ])
            ->assertTooManyRequests();
    }

    private function adminTokenForTests(): string
    {
        return $this->postJson('/api/admin/login', [
            'email' => 'admin@maghriboud.com',
            'password' => 'password123',
        ])->json('data.token');
    }
}
