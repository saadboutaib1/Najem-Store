<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'store_name' => 'MAGHRIB OUD',
            'whatsapp_number' => '+212601892738',
            'currency' => 'د.م.',
            'delivery_fee' => '30',
            'default_language' => 'ar',
            'payment_method' => 'cash_on_delivery',
            'country' => 'Morocco',
            'facebook' => 'https://facebook.com/maghriboud',
            'instagram' => 'https://instagram.com/maghriboud',
            'tiktok' => 'https://tiktok.com/@maghriboud',
            'youtube' => 'https://youtube.com/@maghriboud',
            'buy2_offer_enabled' => '0',
            'buy2_offer_starts_at' => '',
            'buy2_offer_ends_at' => '',
            'buy2_discount_type' => 'percentage',
            'buy2_discount_value' => '10',
            'loyalty_points_enabled' => '1',
            'loyalty_amount_per_point' => '10',
            'loyalty_reward_points' => '100',
            'loyalty_reward_value' => '20',
        ];

        foreach ($settings as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
