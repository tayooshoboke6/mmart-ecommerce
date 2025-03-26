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
        Schema::create('delivery_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_global')->default(false);
            $table->boolean('is_active')->default(true);
            $table->decimal('base_fee', 10, 2)->default(500.00);
            $table->decimal('fee_per_km', 10, 2)->default(100.00);
            $table->decimal('free_threshold', 10, 2)->default(10000.00);
            $table->decimal('min_order', 10, 2)->default(0.00);
            $table->decimal('max_distance', 10, 2)->default(20.00);
            $table->timestamps();
        });
        
        // Insert default global settings
        DB::table('delivery_settings')->insert([
            'is_global' => true,
            'is_active' => true,
            'base_fee' => 500.00,
            'fee_per_km' => 100.00,
            'free_threshold' => 10000.00,
            'min_order' => 0.00,
            'max_distance' => 20.00,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_settings');
    }
};
