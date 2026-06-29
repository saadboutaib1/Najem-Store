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
        $products = Product::query()
            ->with(['category', 'images'])
            ->where('status', 'active')
            ->when($request->filled('category'), function ($query) use ($request): void {
                $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $request->string('category')));
            })
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = $request->string('search');
                $query->where(function ($searchQuery) use ($search): void {
                    $searchQuery
                        ->where('name_ar', 'like', "%{$search}%")
                        ->orWhere('name_en', 'like', "%{$search}%")
                        ->orWhere('description_ar', 'like', "%{$search}%")
                        ->orWhere('description_en', 'like', "%{$search}%");
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
