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
            // Add delivery_base_fee if it doesn't exist
            if (!Schema::hasColumn('store_addresses', 'delivery_base_fee')) {
                $table->decimal('delivery_base_fee', 10, 2)->nullable();
            }
            
            // Add delivery_price_per_km if it doesn't exist
            if (!Schema::hasColumn('store_addresses', 'delivery_price_per_km')) {
                $table->decimal('delivery_price_per_km', 10, 2)->nullable();
            }
            
            // Add free_delivery_threshold if it doesn't exist
            if (!Schema::hasColumn('store_addresses', 'free_delivery_threshold')) {
                $table->decimal('free_delivery_threshold', 10, 2)->nullable();
            }
            
            // Add minimum_order_value if it doesn't exist
            if (!Schema::hasColumn('store_addresses', 'minimum_order_value')) {
                $table->decimal('minimum_order_value', 10, 2)->nullable();
            }
            
            // Add offers_free_delivery if it doesn't exist
            if (!Schema::hasColumn('store_addresses', 'offers_free_delivery')) {
                $table->boolean('offers_free_delivery')->default(false);
            }
            
            // Add delivery_radius_km if it doesn't exist
            if (!Schema::hasColumn('store_addresses', 'delivery_radius_km')) {
                $table->integer('delivery_radius_km')->nullable();
            }
            
            // Add geofence_coordinates if it doesn't exist
            if (!Schema::hasColumn('store_addresses', 'geofence_coordinates')) {
                $table->text('geofence_coordinates')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_addresses', function (Blueprint $table) {
            // Only drop columns that exist
            $columns = [
                'delivery_base_fee',
                'delivery_price_per_km',
                'free_delivery_threshold',
                'minimum_order_value',
                'offers_free_delivery',
                'delivery_radius_km',
                'geofence_coordinates'
            ];
            
            $existingColumns = [];
            foreach ($columns as $column) {
                if (Schema::hasColumn('store_addresses', $column)) {
                    $existingColumns[] = $column;
                }
            }
            
            if (!empty($existingColumns)) {
                $table->dropColumn($existingColumns);
            }
        });
    }
};
