<?php

namespace Database\Seeders;

use App\Models\SocialLink;
use Illuminate\Database\Seeder;

class SocialLinkSeeder extends Seeder
{
    public function run(): void
    {
        $links = [
            ['platform' => 'whatsapp', 'url' => 'https://wa.me/212601892738'],
            ['platform' => 'facebook', 'url' => 'https://facebook.com/maghriboud'],
            ['platform' => 'instagram', 'url' => 'https://instagram.com/maghriboud'],
            ['platform' => 'tiktok', 'url' => 'https://tiktok.com/@maghriboud'],
            ['platform' => 'youtube', 'url' => 'https://youtube.com/@maghriboud'],
        ];

        foreach ($links as $link) {
            SocialLink::query()->updateOrCreate(
                ['platform' => $link['platform']],
                ['url' => $link['url'], 'status' => 'active']
            );
        }
    }
}
