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
                'name_fr' => 'Oud',
                'slug' => 'oud',
                'description_ar' => 'قطع عود مختارة بروائح عميقة تناسب المجالس والهدايا الفاخرة.',
                'description_en' => 'Selected oud pieces with deep aromas, ideal for gatherings and premium gifts.',
                'description_fr' => 'Morceaux de oud aux arômes profonds, pour les salons et les cadeaux haut de gamme.',
                'image' => '/categories/oud.svg',
                'sort_order' => 1,
            ],
            [
                'name_ar' => 'البخور',
                'name_en' => 'Bakhoor',
                'name_fr' => 'Bakhoor',
                'slug' => 'bakhoor',
                'description_ar' => 'خلطات بخور شرقية تمنح البيت لمسة ضيافة دافئة وراقية.',
                'description_en' => 'Oriental bakhoor blends that bring a warm, elegant sense of hospitality to your home.',
                'description_fr' => 'Mélanges de bakhoor orientaux qui apportent à la maison une ambiance chaleureuse, élégante et accueillante.',
                'image' => '/categories/bakhoor.svg',
                'sort_order' => 2,
            ],
            [
                'name_ar' => 'العطور',
                'name_en' => 'Perfumes',
                'name_fr' => 'Parfums',
                'slug' => 'perfumes',
                'description_ar' => 'عطور تجمع بين النفحات العربية والأناقة اليومية.',
                'description_en' => 'Perfumes that combine Arabic notes with everyday elegance.',
                'description_fr' => 'Parfums qui associent des notes arabes à une élégance adaptée au quotidien.',
                'image' => '/categories/perfumes.svg',
                'sort_order' => 3,
            ],
            [
                'name_ar' => 'المسواك',
                'name_en' => 'Miswak',
                'name_fr' => 'Miswak',
                'slug' => 'miswak',
                'description_ar' => 'مسواك طبيعي مناسب للاستخدام اليومي والعناية الشخصية.',
                'description_en' => 'Natural miswak for daily use and personal care.',
                'description_fr' => 'Miswak naturel pour l’usage quotidien et l’hygiène personnelle.',
                'image' => '/categories/miswak.svg',
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $category) {
            Category::query()->updateOrCreate(['slug' => $category['slug']], $category + ['status' => 'active']);
        }
    }
}
