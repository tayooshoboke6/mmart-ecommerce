<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreAddress extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'address_line1',
        'address_line2',
        'formatted_address',
        'city',
        'state',
        'postal_code',
        'country',
        'phone',
        'email',
        'latitude',
        'longitude',
        'is_pickup_location',
        'is_delivery_location',
        'is_active',
        'opening_hours',
        'notes',
        'delivery_base_fee',
        'delivery_price_per_km',
        'free_delivery_threshold',
        'minimum_order_value',
        'offers_free_delivery',
        'delivery_radius_km',
        'geofence_coordinates'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'is_pickup_location' => 'boolean',
        'is_delivery_location' => 'boolean',
        'is_active' => 'boolean',
        'offers_free_delivery' => 'boolean',
        'delivery_base_fee' => 'float',
        'delivery_price_per_km' => 'float',
        'free_delivery_threshold' => 'float',
        'delivery_radius_km' => 'integer'
    ];

    /**
     * Get the full address as a string.
     *
     * @return string
     */
    public function getFullAddressAttribute()
    {
        $parts = [
            $this->address_line1,
            $this->address_line2,
            $this->city,
            $this->state,
            $this->postal_code,
            $this->country
        ];

        return implode(', ', array_filter($parts));
    }

    /**
     * Calculate distance from a given latitude and longitude (in kilometers).
     *
     * @param float $latitude
     * @param float $longitude
     * @return float|null
     */
    public function distanceFrom($latitude, $longitude)
    {
        if (!$this->latitude || !$this->longitude) {
            return null;
        }

        // Earth's radius in kilometers
        $earthRadius = 6371;

        $latFrom = deg2rad($this->latitude);
        $lonFrom = deg2rad($this->longitude);
        $latTo = deg2rad($latitude);
        $lonTo = deg2rad($longitude);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) + cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
        
        return $angle * $earthRadius;
    }
}
