<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name_ar' => 'العود',
                'name_en' => 'Oud',
                'slug' => 'oud',
                'description_ar' => 'قطع عود مختارة بروائح عميقة تناسب المجالس والهدايا الفاخرة.',
                'description_en' => 'Selected oud pieces with deep aromas, ideal for gatherings and premium gifts.',
                'image' => '/categories/oud.svg',
                'sort_order' => 1,
            ],
            [
                'name_ar' => 'البخور',
                'name_en' => 'Bakhoor',
                'slug' => 'bakhoor',
                'description_ar' => 'خلطات بخور شرقية تمنح البيت لمسة ضيافة دافئة وراقية.',
                'description_en' => 'Oriental bakhoor blends that bring a warm, elegant sense of hospitality to your home.',
                'image' => '/categories/bakhoor.svg',
                'sort_order' => 2,
            ],
            [
                'name_ar' => 'العطور',
                'name_en' => 'Perfumes',
                'slug' => 'perfumes',
                'description_ar' => 'عطور تجمع بين النفحات العربية والأناقة اليومية.',
                'description_en' => 'Perfumes that combine Arabic notes with everyday elegance.',
                'image' => '/categories/perfumes.svg',
                'sort_order' => 3,
            ],
            [
                'name_ar' => 'المسواك',
                'name_en' => 'Miswak',
                'slug' => 'miswak',
                'description_ar' => 'مسواك طبيعي مناسب للاستخدام اليومي والعناية الشخصية.',
                'description_en' => 'Carefully selected natural miswak for daily use and personal care.',
                'image' => '/categories/miswak.svg',
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $category) {
            Category::query()->updateOrCreate(['slug' => $category['slug']], $category + ['status' => 'active']);
        }
    }
}
