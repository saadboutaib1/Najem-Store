<?php

namespace Database\Seeders;

use App\Models\SocialLink;
use Illuminate\Database\Seeder;

class SocialLinkSeeder extends Seeder
{
    public function run(): void
    {
        $links = [
            ['platform' => 'whatsapp', 'url' => 'https://wa.me/212600000000'],
            ['platform' => 'facebook', 'url' => 'https://facebook.com/najemstore'],
            ['platform' => 'instagram', 'url' => 'https://instagram.com/najemstore'],
            ['platform' => 'tiktok', 'url' => 'https://tiktok.com/@najemstore'],
            ['platform' => 'youtube', 'url' => 'https://youtube.com/@najemstore'],
        ];

        foreach ($links as $link) {
            SocialLink::query()->updateOrCreate(
                ['platform' => $link['platform']],
                ['url' => $link['url'], 'status' => 'active']
            );
        }
    }
}
