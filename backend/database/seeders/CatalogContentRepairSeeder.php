<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CatalogContentRepairSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'oud' => [
                'name_ar' => 'العود',
                'name_en' => 'Oud',
                'name_fr' => 'Oud',
                'description_ar' => 'قطع عود مختارة بروائح عميقة تناسب المجالس والهدايا الفاخرة.',
                'description_en' => 'Selected oud pieces with deep aromas, ideal for gatherings and premium gifts.',
                'description_fr' => 'Morceaux de oud aux arômes profonds, pour les salons et les cadeaux haut de gamme.',
                'image' => '/categories/oud.svg',
            ],
            'bakhoor' => [
                'name_ar' => 'البخور',
                'name_en' => 'Bakhoor',
                'name_fr' => 'Bakhoor',
                'description_ar' => 'خلطات بخور شرقية تمنح البيت لمسة ضيافة دافئة وراقية.',
                'description_en' => 'Oriental bakhoor blends that bring a warm, elegant sense of hospitality to your home.',
                'description_fr' => 'Mélanges de bakhoor orientaux qui apportent à la maison une ambiance chaleureuse, élégante et accueillante.',
                'image' => '/categories/bakhoor.svg',
            ],
            'perfumes' => [
                'name_ar' => 'العطور',
                'name_en' => 'Perfumes',
                'name_fr' => 'Parfums',
                'description_ar' => 'عطور تجمع بين النفحات العربية والأناقة اليومية.',
                'description_en' => 'Perfumes that combine oriental notes with everyday elegance.',
                'description_fr' => 'Parfums qui associent des notes orientales à une élégance adaptée au quotidien.',
                'image' => '/categories/perfumes.svg',
            ],
            'miswak' => [
                'name_ar' => 'المسواك',
                'name_en' => 'Miswak',
                'name_fr' => 'Miswak',
                'description_ar' => 'مسواك طبيعي مناسب للاستخدام اليومي والعناية الشخصية.',
                'description_en' => 'Natural miswak for daily use and personal care.',
                'description_fr' => 'Miswak naturel pour l’usage quotidien et l’hygiène personnelle.',
                'image' => '/categories/miswak.svg',
            ],
        ];

        $products = [
            'oud-royal' => [
                'name_ar' => 'عود ملكي فاخر علي',
                'name_fr' => 'Oud royal premium',
                'description_ar' => 'عود فاخر برائحة عميقة وثبات ممتاز، مناسب للمناسبات والهدايا الراقية.',
                'description_fr' => 'Oud haut de gamme au parfum profond et à l’excellente tenue, idéal pour les occasions spéciales et les cadeaux élégants.',
                'main_image' => '/products/oud-royal.svg',
            ],
            'oud-cambodian' => [
                'name_ar' => 'عود كمبودي مختار',
                'name_fr' => 'Oud cambodgien sélectionné',
                'description_ar' => 'قطع عود كمبودي برائحة دافئة وغنية لمحبي الطابع الشرقي الأصيل.',
                'description_fr' => 'Morceaux de oud cambodgien au parfum chaud et riche, pensés pour les amateurs de notes orientales authentiques.',
                'main_image' => '/products/oud-cambodian.svg',
            ],
            'oud-indian' => [
                'name_ar' => 'عود هندي طبيعي',
                'name_fr' => 'Oud indien naturel',
                'description_ar' => 'عود هندي طبيعي يناسب الاستخدام اليومي ويمنح المكان رائحة زكية وثابتة.',
                'description_fr' => 'Oud indien naturel adapté à l’usage quotidien, apportant une fragrance élégante et durable à votre espace.',
                'main_image' => '/products/oud-indian.svg',
            ],
            'bakhoor-sultani' => [
                'name_ar' => 'بخور سلطاني',
                'name_fr' => 'Bakhoor sultani',
                'description_ar' => 'بخور شرقي فاخر بلمسة عنبرية مثالية للضيافة والمجالس.',
                'description_fr' => 'Bakhoor oriental luxueux aux notes ambrées, parfait pour accueillir les invités et sublimer les réunions.',
                'main_image' => '/products/bakhoor-sultani.svg',
            ],
            'bakhoor-amber' => [
                'name_ar' => 'بخور العنبر',
                'name_fr' => 'Bakhoor à l’ambre',
                'description_ar' => 'خلطة بخور دافئة تجمع بين العنبر واللمسات الخشبية الناعمة.',
                'description_fr' => 'Mélange de bakhoor chaleureux associant l’ambre à de douces notes boisées.',
                'main_image' => '/products/bakhoor-amber.svg',
            ],
            'bakhoor-musk' => [
                'name_ar' => 'بخور المسك الشرقي',
                'name_fr' => 'Bakhoor musc oriental',
                'description_ar' => 'بخور ناعم بنفحات المسك، مناسب للأجواء الهادئة والاستخدام اليومي.',
                'description_fr' => 'Bakhoor doux aux notes musquées, adapté aux ambiances calmes et à l’usage quotidien.',
                'main_image' => '/products/bakhoor-musk.svg',
            ],
            'perfume-gold-star' => [
                'name_ar' => 'عطر النجم الذهبي',
                'name_fr' => 'Parfum étoile dorée',
                'description_ar' => 'عطر فاخر بتوازن بين النفحات الشرقية والانتعاش العصري.',
                'description_fr' => 'Parfum luxueux qui équilibre les notes orientales avec une fraîcheur moderne.',
                'main_image' => '/products/perfume-gold-star.svg',
            ],
            'perfume-oriental-rose' => [
                'name_ar' => 'عطر الورد الشرقي',
                'name_fr' => 'Parfum rose orientale',
                'description_ar' => 'عطر ورد شرقي أنيق بلمسة دافئة تدوم طوال اليوم.',
                'description_fr' => 'Parfum élégant à la rose orientale, avec un sillage chaleureux qui dure toute la journée.',
                'main_image' => '/products/perfume-oriental-rose.svg',
            ],
            'perfume-white-musk' => [
                'name_ar' => 'عطر المسك الأبيض',
                'name_fr' => 'Parfum musc blanc',
                'description_ar' => 'مسك أبيض ناعم ونقي، مناسب للاستخدام اليومي ولجميع الأذواق.',
                'description_fr' => 'Musc blanc doux et propre, adapté au quotidien et à une large variété de goûts.',
                'main_image' => '/products/perfume-white-musk.svg',
            ],
            'miswak-premium' => [
                'name_ar' => 'مسواك طبيعي فاخر',
                'name_fr' => 'Miswak naturel premium',
                'description_ar' => 'مسواك طبيعي نظيف وسهل الاستخدام اليومي.',
                'description_fr' => 'Miswak naturel, propre et facile à utiliser au quotidien.',
                'main_image' => '/products/miswak.svg',
            ],
            'miswak-madina' => [
                'name_ar' => 'مسواك المدينة',
                'name_fr' => 'Miswak de Médine',
                'description_ar' => 'مسواك بجودة ممتازة ورائحة طبيعية لطيفة.',
                'description_fr' => 'Miswak de qualité supérieure avec un arôme naturel agréable.',
                'main_image' => '/products/miswak.svg',
            ],
            'miswak-mint' => [
                'name_ar' => 'مسواك معطر بالنعناع',
                'name_fr' => 'Miswak menthe fraîche',
                'description_ar' => 'مسواك عملي بانتعاش النعناع للاستخدام السريع خلال اليوم.',
                'description_fr' => 'Miswak pratique aux notes rafraîchissantes de menthe, idéal pour une utilisation rapide au fil de la journée.',
                'main_image' => '/products/miswak.svg',
            ],
        ];

        foreach ($categories as $slug => $data) {
            DB::table('categories')->where('slug', $slug)->update($data);
        }

        foreach ($products as $slug => $data) {
            DB::table('products')->where('slug', $slug)->update($data);
        }
    }
}
