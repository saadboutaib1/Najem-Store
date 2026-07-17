<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table): void {
            if (!Schema::hasColumn('categories', 'name_fr')) {
                $table->string('name_fr')->nullable()->after('name_en');
            }

            if (!Schema::hasColumn('categories', 'description_fr')) {
                $table->text('description_fr')->nullable()->after('description_en');
            }
        });

        Schema::table('products', function (Blueprint $table): void {
            if (!Schema::hasColumn('products', 'name_fr')) {
                $table->string('name_fr')->nullable()->after('name_en');
            }

            if (!Schema::hasColumn('products', 'description_fr')) {
                $table->text('description_fr')->nullable()->after('description_en');
            }
        });

        DB::table('categories')->whereNull('name_fr')->update(['name_fr' => DB::raw('name_en')]);
        DB::table('categories')->whereNull('description_fr')->update(['description_fr' => DB::raw('description_en')]);
        DB::table('products')->whereNull('name_fr')->update(['name_fr' => DB::raw('name_en')]);
        DB::table('products')->whereNull('description_fr')->update(['description_fr' => DB::raw('description_en')]);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            if (Schema::hasColumn('products', 'description_fr')) {
                $table->dropColumn('description_fr');
            }

            if (Schema::hasColumn('products', 'name_fr')) {
                $table->dropColumn('name_fr');
            }
        });

        Schema::table('categories', function (Blueprint $table): void {
            if (Schema::hasColumn('categories', 'description_fr')) {
                $table->dropColumn('description_fr');
            }

            if (Schema::hasColumn('categories', 'name_fr')) {
                $table->dropColumn('name_fr');
            }
        });
    }
};
