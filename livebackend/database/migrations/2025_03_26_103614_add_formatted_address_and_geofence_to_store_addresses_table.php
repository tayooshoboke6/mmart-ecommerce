<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add formatted_address column
        if (!Schema::hasColumn('store_addresses', 'formatted_address')) {
            DB::statement('ALTER TABLE store_addresses ADD COLUMN formatted_address TEXT NULL AFTER address_line2');
        }
        
        // Add geofence_coordinates column
        if (!Schema::hasColumn('store_addresses', 'geofence_coordinates')) {
            DB::statement('ALTER TABLE store_addresses ADD COLUMN geofence_coordinates TEXT NULL AFTER delivery_radius_km');
        }
        
        // Add minimum_order_value column
        if (!Schema::hasColumn('store_addresses', 'minimum_order_value')) {
            DB::statement('ALTER TABLE store_addresses ADD COLUMN minimum_order_value DECIMAL(10,2) NULL DEFAULT 0 AFTER free_delivery_threshold');
        }
        
        // Make city and state nullable
        DB::statement('ALTER TABLE store_addresses MODIFY city VARCHAR(255) NULL');
        DB::statement('ALTER TABLE store_addresses MODIFY state VARCHAR(255) NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop added columns if they exist
        if (Schema::hasColumn('store_addresses', 'formatted_address')) {
            DB::statement('ALTER TABLE store_addresses DROP COLUMN formatted_address');
        }
        
        if (Schema::hasColumn('store_addresses', 'geofence_coordinates')) {
            DB::statement('ALTER TABLE store_addresses DROP COLUMN geofence_coordinates');
        }
        
        if (Schema::hasColumn('store_addresses', 'minimum_order_value')) {
            DB::statement('ALTER TABLE store_addresses DROP COLUMN minimum_order_value');
        }
        
        // Revert city and state to be required
        DB::statement('ALTER TABLE store_addresses MODIFY city VARCHAR(255) NOT NULL');
        DB::statement('ALTER TABLE store_addresses MODIFY state VARCHAR(255) NOT NULL');
    }
};
