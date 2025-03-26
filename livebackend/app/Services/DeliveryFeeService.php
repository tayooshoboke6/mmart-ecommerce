<?php

namespace App\Services;

use App\Models\StoreAddress;
use App\Models\DeliverySettings;
use App\Models\Order;
use Illuminate\Support\Facades\Log;

class DeliveryFeeService
{
    /**
     * Calculate delivery fee based on distance, order subtotal, and store settings
     *
     * @param float $subtotal Order subtotal
     * @param array $customerLocation Customer's location [latitude, longitude]
     * @param int|null $storeId Store ID (optional)
     * @return array Delivery fee details
     */
    public function calculateDeliveryFee(float $subtotal, array $customerLocation, ?int $storeId = null): array
    {
        try {
            Log::info('DeliveryFeeService: Starting calculation', [
                'subtotal' => $subtotal,
                'customerLocation' => $customerLocation,
                'storeId' => $storeId
            ]);
            
            // Validate customer location
            if (!isset($customerLocation[0]) || !isset($customerLocation[1]) || 
                !is_numeric($customerLocation[0]) || !is_numeric($customerLocation[1])) {
                Log::error('DeliveryFeeService: Invalid customer location', [
                    'customerLocation' => $customerLocation
                ]);
                return $this->getErrorResponse("Invalid customer location");
            }
            
            // Get the appropriate store
            $store = $this->getStore($storeId);
            
            if (!$store) {
                Log::error('DeliveryFeeService: No valid store found for delivery');
                return $this->getErrorResponse("No valid store found for delivery");
            }
            
            Log::info('DeliveryFeeService: Found store', [
                'store_id' => $store->id,
                'store_name' => $store->name,
                'store_location' => [$store->latitude, $store->longitude],
                'delivery_radius_km' => $store->delivery_radius_km
            ]);
            
            // Validate store location
            if (!is_numeric($store->latitude) || !is_numeric($store->longitude)) {
                Log::error('DeliveryFeeService: Invalid store coordinates', [
                    'store_latitude' => $store->latitude,
                    'store_longitude' => $store->longitude
                ]);
                return $this->getErrorResponse("Store location is invalid");
            }
            
            // Check if the customer is within delivery zone
            $storeLocation = [$store->latitude, $store->longitude];
            $distanceInKm = $this->calculateDistance($customerLocation, $storeLocation);
            
            Log::info('DeliveryFeeService: Distance calculation', [
                'customerLocation' => $customerLocation,
                'storeLocation' => $storeLocation,
                'distanceInKm' => $distanceInKm,
                'delivery_radius_km' => $store->delivery_radius_km
            ]);
            
            $withinZone = $this->isWithinDeliveryZone($customerLocation, $store);
            
            if (!$withinZone) {
                Log::warning('DeliveryFeeService: Customer outside delivery zone', [
                    'customerLocation' => $customerLocation,
                    'deliveryRadius' => $store->delivery_radius_km,
                    'distance' => $distanceInKm
                ]);
                return $this->getErrorResponse("Sorry, we don't currently deliver to your location.");
            }
            
            // Get global delivery settings
            $globalSettings = $this->getGlobalSettings();
            
            // Get store delivery settings
            $baseFee = $store->delivery_base_fee ?? $globalSettings->base_fee ?? 500; // Default: ₦500 base fee
            $feePerKm = $store->delivery_fee_per_km ?? $globalSettings->fee_per_km ?? 100; // Default: ₦100 per km
            $freeThreshold = $store->delivery_free_threshold ?? $globalSettings->free_threshold ?? 10000; // Default: Free for orders over ₦10,000
            $minOrder = $store->delivery_min_order ?? $globalSettings->min_order ?? 0; // Default: No minimum order
            
            Log::info('DeliveryFeeService: Delivery settings', [
                'baseFee' => $baseFee,
                'feePerKm' => $feePerKm,
                'freeThreshold' => $freeThreshold,
                'minOrder' => $minOrder,
                'subtotal' => $subtotal
            ]);
            
            // Check if order meets minimum requirement
            if ($subtotal < $minOrder) {
                Log::warning('DeliveryFeeService: Order below minimum', [
                    'subtotal' => $subtotal,
                    'minOrder' => $minOrder
                ]);
                return $this->getErrorResponse(
                    "Minimum order for delivery is ₦" . number_format($minOrder) . ". Please add more items.",
                    $distanceInKm
                );
            }
            
            // Calculate fee
            $fee = $baseFee;
            
            // Distance fee (fee per km after first 2km)
            $distanceFee = $distanceInKm <= 2 ? 0 : ceil($distanceInKm - 2) * $feePerKm;
            $fee += $distanceFee;
            
            // Free delivery for orders over threshold
            if ($subtotal >= $freeThreshold) {
                $fee = 0;
            }
            
            // Estimate delivery time (5 minutes + 3 minutes per km)
            $estimatedTime = 5 + ceil($distanceInKm * 3);
            
            Log::info('DeliveryFeeService: Fee calculation results', [
                'baseFee' => $baseFee,
                'distanceFee' => $distanceFee,
                'totalFee' => $fee,
                'estimatedTime' => $estimatedTime,
                'isFreeDelivery' => $subtotal >= $freeThreshold
            ]);
            
            // Prepare message based on fee
            $message = $fee === 0
                ? "Free delivery for your order!"
                : "Delivery fee: ₦" . number_format($fee) . " (" . number_format($distanceInKm, 1) . " km)";
            
            $result = [
                'fee' => $fee,
                'distance' => $distanceInKm,
                'currency' => 'NGN',
                'estimatedTime' => $estimatedTime,
                'isDeliveryAvailable' => true,
                'message' => $message,
                'store_id' => $store->id
            ];
            
            Log::info('DeliveryFeeService: Returning result', $result);
            
            return $result;
        } catch (\Exception $e) {
            Log::error('Error calculating delivery fee: ' . $e->getMessage());
            return $this->getErrorResponse("Unable to calculate delivery fee");
        }
    }
    
    /**
     * Get the appropriate store for delivery
     *
     * @param int|null $storeId Store ID
     * @return StoreAddress|null
     */
    protected function getStore(?int $storeId): ?StoreAddress
    {
        if ($storeId) {
            return StoreAddress::find($storeId);
        }
        
        // If no store ID provided, get the first active store
        return StoreAddress::where('is_active', true)
            ->where('is_delivery_location', true)
            ->first();
    }
    
    /**
     * Get global delivery settings
     *
     * @return DeliverySettings|null
     */
    protected function getGlobalSettings(): ?DeliverySettings
    {
        return DeliverySettings::where('is_global', true)
            ->where('is_active', true)
            ->first();
    }
    
    /**
     * Check if a location is within a store's delivery zone
     *
     * @param array $customerLocation [latitude, longitude]
     * @param StoreAddress $store
     * @return bool
     */
    protected function isWithinDeliveryZone(array $customerLocation, StoreAddress $store): bool
    {
        // Get global settings
        $globalSettings = $this->getGlobalSettings();
        $maxDistance = $globalSettings ? $globalSettings->max_distance : 20; // Default: 20km
        
        // Use store-specific radius if available, otherwise use global max distance
        $radius = $store->delivery_radius_km ?? $maxDistance;
        
        Log::info('DeliveryFeeService: Checking delivery zone', [
            'store_delivery_radius' => $store->delivery_radius_km,
            'global_max_distance' => $maxDistance,
            'effective_radius' => $radius
        ]);
        
        if (!$radius) {
            Log::warning('DeliveryFeeService: No delivery radius defined');
            return false;
        }
        
        $storeLocation = [$store->latitude, $store->longitude];
        $distance = $this->calculateDistance($customerLocation, $storeLocation);
        
        Log::info('DeliveryFeeService: Distance check', [
            'distance' => $distance,
            'radius' => $radius,
            'within_radius' => $distance <= $radius
        ]);
        
        return $distance <= $radius;
    }
    
    /**
     * Calculate distance between two points using Haversine formula
     *
     * @param array $point1 [latitude, longitude]
     * @param array $point2 [latitude, longitude]
     * @return float Distance in kilometers
     */
    protected function calculateDistance(array $point1, array $point2): float
    {
        $lat1 = $point1[0];
        $lon1 = $point1[1];
        $lat2 = $point2[0];
        $lon2 = $point2[1];
        
        Log::info('DeliveryFeeService: Distance calculation inputs', [
            'point1' => $point1,
            'point2' => $point2,
            'lat1' => $lat1,
            'lon1' => $lon1,
            'lat2' => $lat2,
            'lon2' => $lon2
        ]);
        
        // Validate coordinates
        if (!is_numeric($lat1) || !is_numeric($lon1) || !is_numeric($lat2) || !is_numeric($lon2)) {
            Log::error('DeliveryFeeService: Invalid coordinates for distance calculation', [
                'lat1' => $lat1,
                'lon1' => $lon1,
                'lat2' => $lat2,
                'lon2' => $lon2
            ]);
            return 0;
        }
        
        $earthRadius = 6371; // Earth's radius in kilometers
        
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        
        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon/2) * sin($dLon/2);
             
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        $distance = $earthRadius * $c;
        
        Log::info('DeliveryFeeService: Distance calculation result', [
            'distance_km' => $distance,
            'calculation_details' => [
                'dLat' => $dLat,
                'dLon' => $dLon,
                'a' => $a,
                'c' => $c
            ]
        ]);
        
        return $distance;
    }
    
    /**
     * Get error response format
     *
     * @param string $message Error message
     * @param float $distance Distance in km (optional)
     * @return array
     */
    protected function getErrorResponse(string $message, float $distance = 0): array
    {
        return [
            'fee' => 0,
            'distance' => $distance,
            'currency' => 'NGN',
            'estimatedTime' => 0,
            'isDeliveryAvailable' => false,
            'message' => $message
        ];
    }
}
