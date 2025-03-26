<?php

namespace App\Http\Controllers;

use App\Models\StoreAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class StoreAddressController extends Controller
{
    /**
     * Get all active pickup locations for public access.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPublicPickupLocations()
    {
        try {
            $pickupLocations = StoreAddress::where('is_pickup_location', true)
                                          ->where('is_active', true)
                                          ->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $pickupLocations
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching public pickup locations: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch pickup locations'
            ], 500);
        }
    }

    /**
     * Find nearest pickup locations to a given latitude and longitude for public access.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function findNearestPickupLocations(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
                'max_distance' => 'nullable|numeric',
                'limit' => 'nullable|integer|min:1|max:50'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $latitude = $request->input('latitude');
            $longitude = $request->input('longitude');
            $maxDistance = $request->input('max_distance', 50); // Default 50km
            $limit = $request->input('limit', 10); // Default 10 locations
            
            $pickupLocations = StoreAddress::where('is_pickup_location', true)
                                          ->where('is_active', true)
                                          ->get();
            
            // Calculate distance for each location
            $locationsWithDistance = $pickupLocations->map(function($location) use ($latitude, $longitude) {
                $distance = $location->distanceFrom($latitude, $longitude);
                return [
                    'location' => $location,
                    'distance' => $distance
                ];
            })
            ->filter(function($item) use ($maxDistance) {
                return $item['distance'] !== null && $item['distance'] <= $maxDistance;
            })
            ->sortBy('distance')
            ->take($limit)
            ->values();
            
            return response()->json([
                'status' => 'success',
                'data' => $locationsWithDistance
            ]);
        } catch (\Exception $e) {
            Log::error('Error finding nearest pickup locations: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to find nearest pickup locations'
            ], 500);
        }
    }
}
