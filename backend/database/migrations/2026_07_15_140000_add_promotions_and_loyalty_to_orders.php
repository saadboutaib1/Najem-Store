<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->decimal('discount_total', 10, 2)->default(0)->after('delivery_fee');
            $table->unsignedInteger('loyalty_points_earned')->default(0)->after('whatsapp_message');
            $table->timestamp('loyalty_points_awarded_at')->nullable()->after('loyalty_points_earned');
        });

        Schema::create('customer_loyalty_points', function (Blueprint $table): void {
            $table->id();
            $table->string('phone')->unique();
            $table->string('customer_name')->nullable();
            $table->unsignedInteger('total_points')->default(0);
            $table->unsignedInteger('total_orders')->default(0);
            $table->timestamp('last_order_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_loyalty_points');

        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn([
                'discount_total',
                'loyalty_points_earned',
                'loyalty_points_awarded_at',
            ]);
        });
    }
};
