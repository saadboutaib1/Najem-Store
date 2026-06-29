<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\ApiResponse;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(): mixed
    {
        $categories = Category::query()
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return $this->success(CategoryResource::collection($categories)->resolve(), 'Categories loaded.');
    }

    public function show(string $slug): mixed
    {
        $category = Category::query()
            ->where('status', 'active')
            ->where('slug', $slug)
            ->firstOrFail();

        return $this->success((new CategoryResource($category))->resolve(), 'Category loaded.');
    }
}
