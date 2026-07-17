<?php

namespace App\Http\Resources;

use App\Support\ImageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_ar' => $this->name_ar,
            'name_en' => $this->name_en,
            'name_fr' => $this->name_fr,
            'slug' => $this->slug,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => $this->category?->slug),
            'category_slug' => $this->whenLoaded('category', fn () => $this->category?->slug),
            'category_name_ar' => $this->whenLoaded('category', fn () => $this->category?->name_ar),
            'category_name_en' => $this->whenLoaded('category', fn () => $this->category?->name_en),
            'category_name_fr' => $this->whenLoaded('category', fn () => $this->category?->name_fr),
            'description_ar' => $this->description_ar,
            'description_en' => $this->description_en,
            'description_fr' => $this->description_fr,
            'price' => (float) $this->price,
            'old_price' => $this->old_price ? (float) $this->old_price : null,
            'oldPrice' => $this->old_price ? (float) $this->old_price : null,
            'stock' => $this->stock,
            'main_image' => ImageUrl::resolve($this->main_image),
            'image' => ImageUrl::resolve($this->main_image),
            'rating' => (float) $this->rating,
            'is_featured' => (bool) $this->is_featured,
            'isFeatured' => (bool) $this->is_featured,
            'status' => $this->status,
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
