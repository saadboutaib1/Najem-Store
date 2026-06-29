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
            ['slug' => 'oud-royal', 'category' => 'oud', 'name_ar' => 'عود ملكي فاخر', 'name_en' => 'Premium Royal Oud', 'description_ar' => 'عود فاخر برائحة عميقة وثبات ممتاز، مناسب للمناسبات والهدايا الراقية.', 'description_en' => 'Premium oud with a deep aroma and exceptional longevity, ideal for occasions and elegant gifts.', 'price' => 420, 'old_price' => 520, 'stock' => 8, 'main_image' => '/products/oud.svg', 'rating' => 4.9, 'is_featured' => true],
            ['slug' => 'oud-cambodian', 'category' => 'oud', 'name_ar' => 'عود كمبودي مختار', 'name_en' => 'Select Cambodian Oud', 'description_ar' => 'قطع عود كمبودي برائحة دافئة وغنية لمحبي الطابع الشرقي الأصيل.', 'description_en' => 'Cambodian oud pieces with a warm, rich aroma for lovers of authentic oriental notes.', 'price' => 360, 'old_price' => null, 'stock' => 10, 'main_image' => '/products/oud.svg', 'rating' => 4.8, 'is_featured' => true],
            ['slug' => 'oud-indian', 'category' => 'oud', 'name_ar' => 'عود هندي طبيعي', 'name_en' => 'Natural Indian Oud', 'description_ar' => 'عود هندي طبيعي يناسب الاستخدام اليومي ويمنح المكان رائحة زكية وثابتة.', 'description_en' => 'Natural Indian oud for everyday use, bringing a long-lasting, elegant fragrance to your space.', 'price' => 290, 'old_price' => null, 'stock' => 12, 'main_image' => '/products/oud.svg', 'rating' => 4.7, 'is_featured' => false],
            ['slug' => 'bakhoor-sultani', 'category' => 'bakhoor', 'name_ar' => 'بخور سلطاني', 'name_en' => 'Sultani Bakhoor', 'description_ar' => 'بخور شرقي فاخر بلمسة عنبرية مثالية للضيافة والمجالس.', 'description_en' => 'Luxurious oriental bakhoor with amber notes, perfect for guests and gatherings.', 'price' => 180, 'old_price' => 220, 'stock' => 15, 'main_image' => '/products/bakhoor.svg', 'rating' => 4.8, 'is_featured' => true],
            ['slug' => 'bakhoor-amber', 'category' => 'bakhoor', 'name_ar' => 'بخور العنبر', 'name_en' => 'Amber Bakhoor', 'description_ar' => 'خلطة بخور دافئة تجمع بين العنبر واللمسات الخشبية الناعمة.', 'description_en' => 'A warm bakhoor blend combining amber with soft woody notes.', 'price' => 140, 'old_price' => null, 'stock' => 18, 'main_image' => '/products/bakhoor.svg', 'rating' => 4.6, 'is_featured' => false],
            ['slug' => 'bakhoor-musk', 'category' => 'bakhoor', 'name_ar' => 'بخور المسك الشرقي', 'name_en' => 'Oriental Musk Bakhoor', 'description_ar' => 'بخور ناعم بنفحات المسك، مناسب للأجواء الهادئة والاستخدام اليومي.', 'description_en' => 'Soft bakhoor with musk notes, suitable for calm atmospheres and daily use.', 'price' => 125, 'old_price' => null, 'stock' => 20, 'main_image' => '/products/bakhoor.svg', 'rating' => 4.5, 'is_featured' => false],
            ['slug' => 'perfume-gold-star', 'category' => 'perfumes', 'name_ar' => 'عطر النجم الذهبي', 'name_en' => 'Golden Star Perfume', 'description_ar' => 'عطر فاخر بتوازن بين النفحات الشرقية والانتعاش العصري.', 'description_en' => 'A luxurious perfume that balances oriental notes with modern freshness.', 'price' => 230, 'old_price' => 280, 'stock' => 9, 'main_image' => '/products/perfume.svg', 'rating' => 4.9, 'is_featured' => true],
            ['slug' => 'perfume-oriental-rose', 'category' => 'perfumes', 'name_ar' => 'عطر الورد الشرقي', 'name_en' => 'Oriental Rose Perfume', 'description_ar' => 'عطر ورد شرقي أنيق بلمسة دافئة تدوم طوال اليوم.', 'description_en' => 'An elegant oriental rose perfume with a warm trail that lasts all day.', 'price' => 210, 'old_price' => null, 'stock' => 11, 'main_image' => '/products/perfume.svg', 'rating' => 4.7, 'is_featured' => false],
            ['slug' => 'perfume-white-musk', 'category' => 'perfumes', 'name_ar' => 'عطر المسك الأبيض', 'name_en' => 'White Musk Perfume', 'description_ar' => 'مسك أبيض ناعم ونقي، مناسب للاستخدام اليومي ولجميع الأذواق.', 'description_en' => 'Soft, clean white musk suitable for everyday wear and all preferences.', 'price' => 190, 'old_price' => null, 'stock' => 14, 'main_image' => '/products/perfume.svg', 'rating' => 4.6, 'is_featured' => false],
            ['slug' => 'miswak-premium', 'category' => 'miswak', 'name_ar' => 'مسواك طبيعي فاخر', 'name_en' => 'Premium Natural Miswak', 'description_ar' => 'مسواك طبيعي نظيف وسهل الاستخدام اليومي.', 'description_en' => 'Carefully selected natural miswak that is clean and easy to use daily.', 'price' => 25, 'old_price' => null, 'stock' => 50, 'main_image' => '/products/miswak.svg', 'rating' => 4.8, 'is_featured' => true],
            ['slug' => 'miswak-madina', 'category' => 'miswak', 'name_ar' => 'مسواك المدينة', 'name_en' => 'Madinah Miswak', 'description_ar' => 'مسواك بجودة ممتازة ورائحة طبيعية لطيفة.', 'description_en' => 'High-quality miswak with a pleasant natural aroma.', 'price' => 30, 'old_price' => null, 'stock' => 45, 'main_image' => '/products/miswak.svg', 'rating' => 4.7, 'is_featured' => false],
            ['slug' => 'miswak-mint', 'category' => 'miswak', 'name_ar' => 'مسواك معطر بالنعناع', 'name_en' => 'Mint Fresh Miswak', 'description_ar' => 'مسواك عملي بانتعاش النعناع للاستخدام السريع خلال اليوم.', 'description_en' => 'A practical miswak with refreshing mint notes for quick use throughout the day.', 'price' => 35, 'old_price' => null, 'stock' => 36, 'main_image' => '/products/miswak.svg', 'rating' => 4.5, 'is_featured' => false],
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
