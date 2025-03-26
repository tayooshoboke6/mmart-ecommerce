<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('store_addresses', function (Blueprint $table) {
            $table->decimal('delivery_base_fee', 10, 2)->nullable()->default(0);
            $table->decimal('delivery_price_per_km', 10, 2)->nullable()->default(0);
            $table->decimal('free_delivery_threshold', 10, 2)->nullable()->default(0);
            $table->boolean('offers_free_delivery')->default(false);
            $table->integer('delivery_radius_km')->nullable()->default(10);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_addresses', function (Blueprint $table) {
            $table->dropColumn('delivery_base_fee');
            $table->dropColumn('delivery_price_per_km');
            $table->dropColumn('free_delivery_threshold');
            $table->dropColumn('offers_free_delivery');
            $table->dropColumn('delivery_radius_km');
        });
    }
};
