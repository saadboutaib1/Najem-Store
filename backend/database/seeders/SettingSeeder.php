<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'store_name' => 'Najem Store',
            'whatsapp_number' => '+212600000000',
            'currency' => 'د.م.',
            'delivery_fee' => '30',
            'default_language' => 'ar',
            'payment_method' => 'cash_on_delivery',
            'country' => 'Morocco',
            'facebook' => 'https://facebook.com/najemstore',
            'instagram' => 'https://instagram.com/najemstore',
            'tiktok' => 'https://tiktok.com/@najemstore',
            'youtube' => 'https://youtube.com/@najemstore',
        ];

        foreach ($settings as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
