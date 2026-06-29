<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::query()->updateOrCreate(
            ['email' => 'admin@najemstore.com'],
            [
                'name' => 'Najem Store Admin',
                'password' => 'password123',
                'role' => 'admin',
                'status' => 'active',
            ]
        );
    }
}
