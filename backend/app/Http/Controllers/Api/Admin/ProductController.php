<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ImageUploadService;
use App\Support\ApiResponse;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ImageUploadService $images)
    {
    }

    public function index(): mixed
    {
        $products = Product::query()->with(['category', 'images'])->latest()->get();

        return $this->success(ProductResource::collection($products)->resolve(), 'Products loaded.');
    }

    public function store(StoreProductRequest $request): mixed
    {
        $product = Product::query()->create($this->payload($request->validated()));
        $this->storeGalleryImages($product);

        return $this->success((new ProductResource($product->fresh(['category', 'images'])))->resolve(), 'Product created.', 201);
    }

    public function show(Product $product): mixed
    {
        return $this->success((new ProductResource($product->load(['category', 'images'])))->resolve(), 'Product loaded.');
    }

    public function update(UpdateProductRequest $request, Product $product): mixed
    {
        $product->update($this->payload($request->validated(), $product));
        $this->storeGalleryImages($product);

        return $this->success((new ProductResource($product->fresh(['category', 'images'])))->resolve(), 'Product updated.');
    }

    public function destroy(Product $product): mixed
    {
        $product->load('images');
        $this->images->delete($product->main_image);

        foreach ($product->images as $image) {
            $this->images->delete($image->image);
        }

        $product->delete();

        return $this->success(null, 'Product deleted.');
    }

    private function payload(array $data, ?Product $product = null): array
    {
        $removeImage = filter_var($data['remove_image'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (empty($data['slug']) && isset($data['name_en'])) {
            $data['slug'] = Str::slug($data['name_en']);
        }

        if (array_key_exists('oldPrice', $data) && !array_key_exists('old_price', $data)) {
            $data['old_price'] = $data['oldPrice'];
        }

        if (array_key_exists('isFeatured', $data) && !array_key_exists('is_featured', $data)) {
            $data['is_featured'] = $data['isFeatured'];
        }

        if (request()->hasFile('main_image')) {
            $this->images->delete($product?->main_image);
            $data['main_image'] = $this->images->store(request()->file('main_image'), 'products');
        } elseif (!empty($data['image_url'])) {
            $this->images->delete($product?->main_image);
            $data['main_image'] = $data['image_url'];
        } elseif ($removeImage) {
            $this->images->delete($product?->main_image);
            $data['main_image'] = null;
        }

        unset($data['oldPrice'], $data['isFeatured'], $data['image_url'], $data['remove_image'], $data['images']);

        return array_filter($data, fn ($value, $key) => $value !== null || $key === 'main_image', ARRAY_FILTER_USE_BOTH);
    }

    private function storeGalleryImages(Product $product): void
    {
        if (!request()->hasFile('images')) {
            return;
        }

        foreach (request()->file('images') as $index => $image) {
            $product->images()->create([
                'image' => $this->images->store($image, 'products/gallery'),
                'sort_order' => $index,
            ]);
        }
    }
}
