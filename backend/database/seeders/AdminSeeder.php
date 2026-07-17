<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_SEED_EMAIL');
        $password = env('ADMIN_SEED_PASSWORD');

        if (!$email || !$password) {
            $this->command?->warn('AdminSeeder skipped: ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are not configured.');
            return;
        }

        Admin::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => env('ADMIN_SEED_NAME', 'MAGHRIB OUD Admin'),
                'password' => $password,
                'role' => 'admin',
                'status' => 'active',
            ]
        );
    }
}