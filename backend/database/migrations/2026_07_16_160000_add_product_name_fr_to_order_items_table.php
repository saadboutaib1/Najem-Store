<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('order_items', 'product_name_fr')) {
            Schema::table('order_items', function (Blueprint $table): void {
                $table->string('product_name_fr')->nullable()->after('product_name_en');
            });
        }

        DB::table('order_items')
            ->select('id', 'product_id', 'product_name_en')
            ->orderBy('id')
            ->chunk(100, function ($items): void {
                foreach ($items as $item) {
                    $nameFr = $item->product_id
                        ? DB::table('products')->where('id', $item->product_id)->value('name_fr')
                        : null;

                    DB::table('order_items')
                        ->where('id', $item->id)
                        ->update(['product_name_fr' => $nameFr ?: $item->product_name_en]);
                }
            });
    }

    public function down(): void
    {
        if (Schema::hasColumn('order_items', 'product_name_fr')) {
            Schema::table('order_items', function (Blueprint $table): void {
                $table->dropColumn('product_name_fr');
            });
        }
    }
};