<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $categories = [
            'oud' => [
                'name_fr' => 'Oud',
                'description_fr' => 'Morceaux de oud soigneusement sélectionnés aux arômes profonds, parfaits pour les salons et les cadeaux haut de gamme.',
            ],
            'bakhoor' => [
                'name_fr' => 'Bakhoor',
                'description_fr' => 'Mélanges de bakhoor orientaux qui apportent à la maison une ambiance chaleureuse, élégante et accueillante.',
            ],
            'perfumes' => [
                'name_fr' => 'Parfums',
                'description_fr' => 'Parfums qui associent des notes orientales à une élégance adaptée au quotidien.',
            ],
            'miswak' => [
                'name_fr' => 'Miswak',
                'description_fr' => 'Miswak naturel soigneusement sélectionné pour l’usage quotidien et l’hygiène personnelle.',
            ],
        ];

        $products = [
            'oud-royal' => [
                'name_fr' => 'Oud royal premium',
                'description_fr' => 'Oud haut de gamme au parfum profond et à l’excellente tenue, idéal pour les occasions spéciales et les cadeaux élégants.',
            ],
            'oud-cambodian' => [
                'name_fr' => 'Oud cambodgien sélectionné',
                'description_fr' => 'Morceaux de oud cambodgien au parfum chaud et riche, pensés pour les amateurs de notes orientales authentiques.',
            ],
            'oud-indian' => [
                'name_fr' => 'Oud indien naturel',
                'description_fr' => 'Oud indien naturel adapté à l’usage quotidien, apportant une fragrance élégante et durable à votre espace.',
            ],
            'bakhoor-sultani' => [
                'name_fr' => 'Bakhoor sultani',
                'description_fr' => 'Bakhoor oriental luxueux aux notes ambrées, parfait pour accueillir les invités et sublimer les réunions.',
            ],
            'bakhoor-amber' => [
                'name_fr' => 'Bakhoor à l’ambre',
                'description_fr' => 'Mélange de bakhoor chaleureux associant l’ambre à de douces notes boisées.',
            ],
            'bakhoor-musk' => [
                'name_fr' => 'Bakhoor musc oriental',
                'description_fr' => 'Bakhoor doux aux notes musquées, adapté aux ambiances calmes et à l’usage quotidien.',
            ],
            'perfume-gold-star' => [
                'name_fr' => 'Parfum étoile dorée',
                'description_fr' => 'Parfum luxueux qui équilibre les notes orientales avec une fraîcheur moderne.',
            ],
            'perfume-oriental-rose' => [
                'name_fr' => 'Parfum rose orientale',
                'description_fr' => 'Parfum élégant à la rose orientale, avec un sillage chaleureux qui dure toute la journée.',
            ],
            'perfume-white-musk' => [
                'name_fr' => 'Parfum musc blanc',
                'description_fr' => 'Musc blanc doux et propre, adapté au quotidien et à une large variété de goûts.',
            ],
            'miswak-premium' => [
                'name_fr' => 'Miswak naturel premium',
                'description_fr' => 'Miswak naturel soigneusement sélectionné, propre et facile à utiliser au quotidien.',
            ],
            'miswak-madina' => [
                'name_fr' => 'Miswak de Médine',
                'description_fr' => 'Miswak de qualité supérieure avec un arôme naturel agréable.',
            ],
            'miswak-mint' => [
                'name_fr' => 'Miswak menthe fraîche',
                'description_fr' => 'Miswak pratique aux notes rafraîchissantes de menthe, idéal pour une utilisation rapide au fil de la journée.',
            ],
        ];

        foreach ($categories as $slug => $translation) {
            $this->fillFrenchFields('categories', $slug, $translation);
        }

        foreach ($products as $slug => $translation) {
            $this->fillFrenchFields('products', $slug, $translation);
        }
    }

    public function down(): void
    {
        //
    }

    private function fillFrenchFields(string $table, string $slug, array $translation): void
    {
        $record = DB::table($table)->where('slug', $slug)->first();

        if (!$record) {
            return;
        }

        $updates = [];

        if (empty($record->name_fr) || $record->name_fr === $record->name_en) {
            $updates['name_fr'] = $translation['name_fr'];
        }

        if (empty($record->description_fr) || $record->description_fr === $record->description_en) {
            $updates['description_fr'] = $translation['description_fr'];
        }

        if ($updates !== []) {
            DB::table($table)->where('slug', $slug)->update($updates);
        }
    }
};
