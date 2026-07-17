<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request): mixed
    {
        $filters = $request->validate([
            'category' => ['nullable', 'string', 'max:255'],
            'search' => ['nullable', 'string', 'max:120'],
        ]);

        $category = $filters['category'] ?? null;
        $search = isset($filters['search']) ? trim((string) $filters['search']) : null;

        $products = Product::query()
            ->with(['category', 'images'])
            ->where('status', 'active')
            ->when($category, function ($query) use ($category): void {
                $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $category));
            })
            ->when($search, function ($query) use ($search): void {
                $query->where(function ($searchQuery) use ($search): void {
                    $searchQuery
                        ->where('name_ar', 'like', "%{$search}%")
                        ->orWhere('name_en', 'like', "%{$search}%")
                        ->orWhere('name_fr', 'like', "%{$search}%")
                        ->orWhere('description_ar', 'like', "%{$search}%")
                        ->orWhere('description_en', 'like', "%{$search}%")
                        ->orWhere('description_fr', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get();

        return $this->success(ProductResource::collection($products)->resolve(), 'Products loaded.');
    }

    public function featured(): mixed
    {
        $products = Product::query()
            ->with(['category', 'images'])
            ->where('status', 'active')
            ->where('is_featured', true)
            ->latest()
            ->get();

        return $this->success(ProductResource::collection($products)->resolve(), 'Featured products loaded.');
    }

    public function show(int $id): mixed
    {
        $product = Product::query()
            ->with(['category', 'images'])
            ->where('status', 'active')
            ->findOrFail($id);

        return $this->success((new ProductResource($product))->resolve(), 'Product loaded.');
    }

    public function showBySlug(string $slug): mixed
    {
        $product = Product::query()
            ->with(['category', 'images'])
            ->where('status', 'active')
            ->where('slug', $slug)
            ->firstOrFail();

        return $this->success((new ProductResource($product))->resolve(), 'Product loaded.');
    }
}
