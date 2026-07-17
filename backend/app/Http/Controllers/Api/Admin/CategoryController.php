<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\ImageUploadService;
use App\Support\ApiResponse;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ImageUploadService $images)
    {
    }

    public function index(): mixed
    {
        $categories = Category::query()->orderBy('sort_order')->orderBy('id')->get();

        return $this->success(CategoryResource::collection($categories)->resolve(), 'Categories loaded.');
    }

    public function store(StoreCategoryRequest $request): mixed
    {
        $data = $this->payload($request->validated());
        $category = Category::query()->create($data);

        return $this->success((new CategoryResource($category))->resolve(), 'Category created.', 201);
    }

    public function update(UpdateCategoryRequest $request, Category $category): mixed
    {
        $category->update($this->payload($request->validated(), $category));

        return $this->success((new CategoryResource($category->fresh()))->resolve(), 'Category updated.');
    }

    public function destroy(Category $category): mixed
    {
        $category->load('products.images');
        $this->images->delete($category->image);

        foreach ($category->products as $product) {
            $this->images->delete($product->main_image);

            foreach ($product->images as $image) {
                $this->images->delete($image->image);
            }
        }

        $category->delete();

        return $this->success(null, 'Category deleted.');
    }

    private function payload(array $data, ?Category $category = null): array
    {
        $removeImage = filter_var($data['remove_image'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (empty($data['slug']) && isset($data['name_en'])) {
            $data['slug'] = Str::slug($data['name_en']);
        }

        if (request()->hasFile('image')) {
            $this->images->delete($category?->image);
            $data['image'] = $this->images->store(request()->file('image'), 'categories');
        } elseif (!empty($data['image_url'])) {
            $this->images->delete($category?->image);
            $data['image'] = $data['image_url'];
        } elseif ($removeImage) {
            $this->images->delete($category?->image);
            $data['image'] = null;
        }

        unset($data['image_url'], $data['remove_image']);

        return array_filter($data, fn ($value, $key) => $value !== null || $key === 'image', ARRAY_FILTER_USE_BOTH);
    }
}
