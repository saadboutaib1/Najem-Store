<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categoryIds = Category::query()->pluck('id', 'slug');

        $products = [
            ['slug' => 'oud-royal', 'category' => 'oud', 'name_ar' => 'عود ملكي فاخر', 'name_en' => 'Premium Royal Oud', 'name_fr' => 'Oud royal premium', 'description_ar' => 'عود فاخر برائحة عميقة وثبات ممتاز، مناسب للمناسبات والهدايا الراقية.', 'description_en' => 'Premium oud with a deep aroma and exceptional longevity, ideal for occasions and elegant gifts.', 'description_fr' => 'Oud haut de gamme au parfum profond et à l’excellente tenue, idéal pour les occasions spéciales et les cadeaux élégants.', 'price' => 420, 'old_price' => 520, 'stock' => 8, 'main_image' => '/products/oud-royal.svg', 'rating' => 4.9, 'is_featured' => true],
            ['slug' => 'oud-cambodian', 'category' => 'oud', 'name_ar' => 'عود كمبودي مختار', 'name_en' => 'Select Cambodian Oud', 'name_fr' => 'Oud cambodgien sélectionné', 'description_ar' => 'قطع عود كمبودي برائحة دافئة وغنية لمحبي الطابع الشرقي الأصيل.', 'description_en' => 'Cambodian oud pieces with a warm, rich aroma for lovers of authentic oriental notes.', 'description_fr' => 'Morceaux de oud cambodgien au parfum chaud et riche, pensés pour les amateurs de notes orientales authentiques.', 'price' => 360, 'old_price' => null, 'stock' => 10, 'main_image' => '/products/oud-cambodian.svg', 'rating' => 4.8, 'is_featured' => true],
            ['slug' => 'oud-indian', 'category' => 'oud', 'name_ar' => 'عود هندي طبيعي', 'name_en' => 'Natural Indian Oud', 'name_fr' => 'Oud indien naturel', 'description_ar' => 'عود هندي طبيعي يناسب الاستخدام اليومي ويمنح المكان رائحة زكية وثابتة.', 'description_en' => 'Natural Indian oud for everyday use, bringing a long-lasting, elegant fragrance to your space.', 'description_fr' => 'Oud indien naturel adapté à l’usage quotidien, apportant une fragrance élégante et durable à votre espace.', 'price' => 290, 'old_price' => null, 'stock' => 12, 'main_image' => '/products/oud-indian.svg', 'rating' => 4.7, 'is_featured' => false],
            ['slug' => 'bakhoor-sultani', 'category' => 'bakhoor', 'name_ar' => 'بخور سلطاني', 'name_en' => 'Sultani Bakhoor', 'name_fr' => 'Bakhoor sultani', 'description_ar' => 'بخور شرقي فاخر بلمسة عنبرية مثالية للضيافة والمجالس.', 'description_en' => 'Luxurious oriental bakhoor with amber notes, perfect for guests and gatherings.', 'description_fr' => 'Bakhoor oriental luxueux aux notes ambrées, parfait pour accueillir les invités et sublimer les réunions.', 'price' => 180, 'old_price' => 220, 'stock' => 15, 'main_image' => '/products/bakhoor-sultani.svg', 'rating' => 4.8, 'is_featured' => true],
            ['slug' => 'bakhoor-amber', 'category' => 'bakhoor', 'name_ar' => 'بخور العنبر', 'name_en' => 'Amber Bakhoor', 'name_fr' => 'Bakhoor à l’ambre', 'description_ar' => 'خلطة بخور دافئة تجمع بين العنبر واللمسات الخشبية الناعمة.', 'description_en' => 'A warm bakhoor blend combining amber with soft woody notes.', 'description_fr' => 'Mélange de bakhoor chaleureux associant l’ambre à de douces notes boisées.', 'price' => 140, 'old_price' => null, 'stock' => 18, 'main_image' => '/products/bakhoor-amber.svg', 'rating' => 4.6, 'is_featured' => false],
            ['slug' => 'bakhoor-musk', 'category' => 'bakhoor', 'name_ar' => 'بخور المسك الشرقي', 'name_en' => 'Oriental Musk Bakhoor', 'name_fr' => 'Bakhoor musc oriental', 'description_ar' => 'بخور ناعم بنفحات المسك، مناسب للأجواء الهادئة والاستخدام اليومي.', 'description_en' => 'Soft bakhoor with musk notes, suitable for calm atmospheres and daily use.', 'description_fr' => 'Bakhoor doux aux notes musquées, adapté aux ambiances calmes et à l’usage quotidien.', 'price' => 125, 'old_price' => null, 'stock' => 20, 'main_image' => '/products/bakhoor-musk.svg', 'rating' => 4.5, 'is_featured' => false],
            ['slug' => 'perfume-gold-star', 'category' => 'perfumes', 'name_ar' => 'عطر النجم الذهبي', 'name_en' => 'Golden Star Perfume', 'name_fr' => 'Parfum étoile dorée', 'description_ar' => 'عطر فاخر بتوازن بين النفحات الشرقية والانتعاش العصري.', 'description_en' => 'A luxurious perfume that balances oriental notes with modern freshness.', 'description_fr' => 'Parfum luxueux qui équilibre les notes orientales avec une fraîcheur moderne.', 'price' => 230, 'old_price' => 280, 'stock' => 9, 'main_image' => '/products/perfume-gold-star.svg', 'rating' => 4.9, 'is_featured' => true],
            ['slug' => 'perfume-oriental-rose', 'category' => 'perfumes', 'name_ar' => 'عطر الورد الشرقي', 'name_en' => 'Oriental Rose Perfume', 'name_fr' => 'Parfum rose orientale', 'description_ar' => 'عطر ورد شرقي أنيق بلمسة دافئة تدوم طوال اليوم.', 'description_en' => 'An elegant oriental rose perfume with a warm trail that lasts all day.', 'description_fr' => 'Parfum élégant à la rose orientale, avec un sillage chaleureux qui dure toute la journée.', 'price' => 210, 'old_price' => null, 'stock' => 11, 'main_image' => '/products/perfume-oriental-rose.svg', 'rating' => 4.7, 'is_featured' => false],
            ['slug' => 'perfume-white-musk', 'category' => 'perfumes', 'name_ar' => 'عطر المسك الأبيض', 'name_en' => 'White Musk Perfume', 'name_fr' => 'Parfum musc blanc', 'description_ar' => 'مسك أبيض ناعم ونقي، مناسب للاستخدام اليومي ولجميع الأذواق.', 'description_en' => 'Soft, clean white musk suitable for everyday wear and all preferences.', 'description_fr' => 'Musc blanc doux et propre, adapté au quotidien et à une large variété de goûts.', 'price' => 190, 'old_price' => null, 'stock' => 14, 'main_image' => '/products/perfume-white-musk.svg', 'rating' => 4.6, 'is_featured' => false],
            ['slug' => 'miswak-premium', 'category' => 'miswak', 'name_ar' => 'مسواك طبيعي فاخر', 'name_en' => 'Premium Natural Miswak', 'name_fr' => 'Miswak naturel premium', 'description_ar' => 'مسواك طبيعي نظيف وسهل الاستخدام اليومي.', 'description_en' => 'Natural miswak, clean and easy to use daily.', 'description_fr' => 'Miswak naturel, propre et facile à utiliser au quotidien.', 'price' => 25, 'old_price' => null, 'stock' => 50, 'main_image' => '/products/miswak.svg', 'rating' => 4.8, 'is_featured' => true],
            ['slug' => 'miswak-madina', 'category' => 'miswak', 'name_ar' => 'مسواك المدينة', 'name_en' => 'Madinah Miswak', 'name_fr' => 'Miswak de Médine', 'description_ar' => 'مسواك بجودة ممتازة ورائحة طبيعية لطيفة.', 'description_en' => 'High-quality miswak with a pleasant natural aroma.', 'description_fr' => 'Miswak de qualité supérieure avec un arôme naturel agréable.', 'price' => 30, 'old_price' => null, 'stock' => 45, 'main_image' => '/products/miswak.svg', 'rating' => 4.7, 'is_featured' => false],
            ['slug' => 'miswak-mint', 'category' => 'miswak', 'name_ar' => 'مسواك معطر بالنعناع', 'name_en' => 'Mint Fresh Miswak', 'name_fr' => 'Miswak menthe fraîche', 'description_ar' => 'مسواك عملي بانتعاش النعناع للاستخدام السريع خلال اليوم.', 'description_en' => 'A practical miswak with refreshing mint notes for quick use throughout the day.', 'description_fr' => 'Miswak pratique aux notes rafraîchissantes de menthe, idéal pour une utilisation rapide au fil de la journée.', 'price' => 35, 'old_price' => null, 'stock' => 36, 'main_image' => '/products/miswak.svg', 'rating' => 4.5, 'is_featured' => false],
        ];

        foreach ($products as $product) {
            $categorySlug = $product['category'];
            unset($product['category']);
            $product['category_id'] = $categoryIds[$categorySlug];
            $product['status'] = 'active';

            Product::query()->updateOrCreate(['slug' => $product['slug']], $product);
        }
    }
}
