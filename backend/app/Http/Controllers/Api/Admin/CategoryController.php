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
        $category->delete();

        return $this->success(null, 'Category deleted.');
    }

    private function payload(array $data, ?Category $category = null): array
    {
        if (empty($data['slug']) && isset($data['name_en'])) {
            $data['slug'] = Str::slug($data['name_en']);
        }

        if (request()->hasFile('image')) {
            $data['image'] = $this->images->store(request()->file('image'), 'categories');
        } elseif (!empty($data['image_url'])) {
            $data['image'] = $data['image_url'];
        }

        unset($data['image_url']);

        return array_filter($data, fn ($value) => $value !== null);
    }
}
