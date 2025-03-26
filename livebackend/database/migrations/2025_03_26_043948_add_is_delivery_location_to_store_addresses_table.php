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
            $table->boolean('is_delivery_location')->default(false)->after('is_pickup_location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_addresses', function (Blueprint $table) {
            $table->dropColumn('is_delivery_location');
        });
    }
};
