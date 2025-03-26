<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductMeasurement;
use App\Models\Category;
use App\Models\ProductImage;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    protected $cloudinaryService;
    protected $cachePrefix = 'products_';
    protected $cacheDuration = 900; // 15 minutes in seconds

    /**
     * Create a new controller instance.
     *
     * @param CloudinaryService $cloudinaryService
     * @return void
     */
    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    /**
     * Get a dynamic cache key based on the latest product update.
     *
     * @return string
     */
    protected function getCacheKey($suffix = '')
    {
        // Get the timestamp of the most recently updated product
        $latestUpdate = Product::max('updated_at');
        $timestamp = $latestUpdate ? strtotime($latestUpdate) : time();
        
        return $this->cachePrefix . 'timestamp_' . $timestamp . $suffix;
    }

    /**
     * Clear all product-related cache.
     *
     * @return void
     */
    protected function clearProductCache()
    {
        // Clear cache for all keys with the products_ prefix
        $keys = Cache::get('product_cache_keys', []);
        foreach ($keys as $key) {
            Cache::forget($key);
        }
        Cache::forget('product_cache_keys');
        
        // Also clear any category cache since product counts might be affected
        if (method_exists('\App\Http\Controllers\Admin\CategoryAdminController', 'clearCategoryCache')) {
            app()->make('\App\Http\Controllers\Admin\CategoryAdminController')->clearCategoryCache();
        }
    }

    /**
     * Add a key to the list of product cache keys.
     *
     * @param string $key
     * @return void
     */
    protected function addCacheKey($key)
    {
        $keys = Cache::get('product_cache_keys', []);
        if (!in_array($key, $keys)) {
            $keys[] = $key;
            Cache::put('product_cache_keys', $keys, $this->cacheDuration * 2);
        }
    }

    /**
     * Display a listing of the products.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // Generate a unique cache key based on the request parameters
        $cacheKey = $this->getCacheKey('_index_' . md5(json_encode($request->all())));
        $this->addCacheKey($cacheKey);

        // Try to get from cache first
        return Cache::remember($cacheKey, $this->cacheDuration, function () use ($request) {
            $query = Product::with(['category', 'measurements'])
                ->when($request->has('category_id'), function ($q) use ($request) {
                    return $q->where('category_id', $request->category_id);
                })
                ->when($request->has('featured'), function ($q) use ($request) {
                    return $q->where('is_featured', $request->boolean('featured'));
                })
                ->when($request->has('search'), function ($q) use ($request) {
                    return $q->where('name', 'like', '%' . $request->search . '%')
                        ->orWhere('description', 'like', '%' . $request->search . '%');
                })
                ->when($request->has('min_price'), function ($q) use ($request) {
                    return $q->where('base_price', '>=', $request->min_price);
                })
                ->when($request->has('max_price'), function ($q) use ($request) {
                    return $q->where('base_price', '<=', $request->max_price);
                })
                // Filter by stock status
                ->when($request->has('stock_status'), function ($q) use ($request) {
                    switch ($request->stock_status) {
                        case 'in_stock':
                            return $q->where('stock_quantity', '>', 10); // Products with more than 10 items
                        case 'low_stock':
                            return $q->whereBetween('stock_quantity', [1, 10]); // Products with 1-10 items
                        case 'out_of_stock':
                            return $q->where('stock_quantity', '=', 0); // Products with 0 items
                        default:
                            return $q;
                    }
                })
                // Filter by expiry status
                ->when($request->has('expiry_status'), function ($q) use ($request) {
                    $today = now()->format('Y-m-d');
                    $thirtyDaysFromNow = now()->addDays(30)->format('Y-m-d');
                    
                    switch ($request->expiry_status) {
                        case 'about_to_expire':
                            // Products expiring within the next 30 days
                            return $q->whereNotNull('expiry_date')
                                    ->whereDate('expiry_date', '>=', $today)
                                    ->whereDate('expiry_date', '<=', $thirtyDaysFromNow);
                        case 'expired':
                            // Products that have already expired
                            return $q->whereNotNull('expiry_date')
                                    ->whereDate('expiry_date', '<', $today);
                        default:
                            return $q;
                    }
                });

            // Default to active products for non-admin users
            if (!$request->has('include_inactive') || !$request->user() || !$request->user()->hasRole('admin')) {
                $query->where('is_active', true);
            }

            $products = $query->orderBy($request->sort_by ?? 'created_at', $request->sort_direction ?? 'desc')
                ->paginate($request->per_page ?? 15);

            return response()->json($products);
        });
    }

    /**
     * Store a newly created product in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            // Log the incoming request data for debugging
            Log::info('Product creation request data:', [
                'request_data' => $request->all()
            ]);

            // Validate request
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'sale_price' => 'nullable|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'sku' => 'required|string|max:100|unique:products',
                'category_id' => 'required|exists:categories,id',
                'image_url' => 'nullable|string',
                'images' => 'nullable|array',
                'images.*' => 'nullable|string',
                'measurements' => 'nullable|array',
                'measurements.*.name' => 'nullable|string|max:100',
                'measurements.*.value' => 'nullable|string|max:100',
                'measurements.*.unit' => 'nullable|string|max:20',
                'measurements.*.price_adjustment' => 'nullable|numeric',
                'measurements.*.stock' => 'nullable|integer|min:0',
                'measurements.*.is_default' => 'nullable|boolean',
                'weight' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                Log::error('Product validation failed:', [
                    'errors' => $validator->errors()->toArray()
                ]);
                return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
            }

            // Generate slug
            $slug = Str::slug($request->name);

            // Handle main product image
            $productImage = $request->image_url;
            // For now, we'll use the image URL directly without Cloudinary processing
            // This will be replaced with proper Cloudinary integration later
            
            // Add debugging logs
            Log::info('Product creation image URL handling:', [
                'request_has_image_url' => $request->has('image_url'),
                'request_image_url' => $request->image_url,
                'product_image_variable' => $productImage
            ]);
            
            // Create product
            $product = Product::create([
                'name' => $request->name,
                'slug' => $slug,
                'description' => $request->description,
                'short_description' => $request->short_description,
                'base_price' => $request->price, // Map price to base_price
                'sale_price' => $request->sale_price,
                'stock_quantity' => $request->stock, // Map stock to stock_quantity
                'sku' => $request->sku,
                'category_id' => $request->category_id,
                'is_active' => $request->boolean('is_active', true),
                'is_featured' => $request->boolean('is_featured', false),
                'is_new_arrival' => $request->boolean('is_new_arrival', false),
                'is_hot_deal' => $request->boolean('is_hot_deal', false),
                'is_best_seller' => $request->boolean('is_best_seller', false),
                'is_expiring_soon' => $request->boolean('is_expiring_soon', false),
                'is_clearance' => $request->boolean('is_clearance', false),
                'is_recommended' => $request->boolean('is_recommended', false),
                'brand' => $request->brand,
                'barcode' => $request->barcode,
                'expiry_date' => $request->expiry_date,
                'meta_data' => $request->meta_data,
                'image_url' => $request->image_url, // Use the raw image URL directly from the request
                'weight' => $request->weight,
            ]);

            // If image_url is provided, also create a related image record
            if ($request->image_url) {
                $product->images()->create([
                    'image_path' => $request->image_url,
                    'is_primary' => true,
                    'sort_order' => 0
                ]);
                
                // Refresh the product to ensure the relationship is loaded correctly
                $product = $product->fresh();
            }
            
            // Create measurements if provided
            if ($request->has('measurements')) {
                foreach ($request->measurements as $measurementData) {
                    $product->measurements()->create([
                        'name' => $measurementData['name'],
                        'value' => $measurementData['value'],
                        'unit' => $measurementData['unit'] ?? null,
                        'price' => $product->base_price + ($measurementData['price_adjustment'] ?? 0),
                        'sale_price' => $product->sale_price ? ($product->sale_price + ($measurementData['price_adjustment'] ?? 0)) : null,
                        'stock_quantity' => $measurementData['stock'] ?? $product->stock_quantity,
                        'sku' => $product->sku . '-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $measurementData['name']), 0, 3)),
                        'is_default' => $measurementData['is_default'] ?? false,
                        'is_active' => true,
                    ]);
                }
            }

            // Create additional images if provided
            if ($request->has('images')) {
                foreach ($request->images as $imageUrl) {
                    // Handle image URL or base64
                    $finalImageUrl = $imageUrl;
                    if (strpos($imageUrl, 'data:image') === 0) {
                        // Handle base64 encoded image
                        $finalImageUrl = $this->uploadBase64Image($imageUrl, $request->sku . '-' . uniqid());
                    }
                    
                    $product->images()->create([
                        'image_path' => $finalImageUrl,
                        'is_primary' => false,
                        'sort_order' => 0
                    ]);
                }
            }

            // Clear cache after creating a new product
            $this->clearProductCache();

            return response()->json(['message' => 'Product created successfully', 'product' => $product->load('category', 'measurements', 'images')], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create product: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified product.
     *
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        // Generate a cache key for this specific product
        $cacheKey = $this->getCacheKey('_show_' . $id);
        $this->addCacheKey($cacheKey);

        // Try to get from cache first
        return Cache::remember($cacheKey, $this->cacheDuration, function () use ($id) {
            $product = Product::with(['category', 'measurements', 'images'])->findOrFail($id);

            // Log the response for debugging
            Log::info('Product detail response for ID: ' . $id, [
                'product' => $product->toArray()
            ]);

            // Format the response to match what the frontend expects
            return response()->json([
                'success' => true,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'description' => $product->description,
                    'short_description' => $product->short_description,
                    'base_price' => $product->base_price,
                    'price' => $product->base_price, // Alias for frontend compatibility
                    'sale_price' => $product->sale_price,
                    'stock_quantity' => $product->stock_quantity,
                    'stock' => $product->stock_quantity, // Alias for frontend compatibility
                    'sku' => $product->sku,
                    'barcode' => $product->barcode,
                    'is_featured' => $product->is_featured,
                    'featured' => $product->is_featured, // Alias for frontend compatibility
                    'is_active' => $product->is_active,
                    'is_new_arrival' => $product->is_new_arrival,
                    'is_hot_deal' => $product->is_hot_deal,
                    'is_best_seller' => $product->is_best_seller,
                    'is_expiring_soon' => $product->is_expiring_soon,
                    'is_clearance' => $product->is_clearance,
                    'is_recommended' => $product->is_recommended,
                    'category_id' => $product->category_id,
                    'category' => $product->category,
                    'category_name' => $product->category ? $product->category->name : null,
                    'brand' => $product->brand,
                    'expiry_date' => $product->expiry_date,
                    'meta_data' => $product->meta_data,
                    'total_sold' => $product->total_sold,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                    'images' => $product->images->map(function($image) {
                        return $image->image_path;
                    }),
                    'image' => $product->image,
                    'image_url' => $product->image_url,
                    'measurements' => $product->measurements,
                    'is_on_sale' => $product->is_on_sale,
                    'is_in_stock' => $product->is_in_stock,
                    'discount_percentage' => $product->discount_percentage
                ]
            ]);
        });
    }

    /**
     * Update the specified product in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try {
            // Log the incoming request data for debugging
            Log::info('Product update request data:', [
                'request_data' => $request->all(),
                'has_image_url' => $request->has('image_url'),
                'image_url_value' => $request->image_url
            ]);
            
            // Find the product
            $product = Product::findOrFail($id);
            
            // Map frontend field names to backend field names if needed
            $requestData = $request->all();
            
            // Handle price field (frontend might send 'price' instead of 'base_price')
            if (isset($requestData['price']) && !isset($requestData['base_price'])) {
                $requestData['base_price'] = $requestData['price'];
            }
            
            // Handle stock field (frontend might send 'stock' instead of 'stock_quantity')
            if (isset($requestData['stock']) && !isset($requestData['stock_quantity'])) {
                $requestData['stock_quantity'] = $requestData['stock'];
            }
            
            // Validate request
            $validator = Validator::make($requestData, [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'base_price' => 'required|numeric|min:0',
                'sale_price' => 'nullable|numeric|min:0',
                'stock_quantity' => 'required|integer|min:0',
                'sku' => 'required|string|max:100|unique:products,sku,' . $id,
                'category_id' => 'required|exists:categories,id',
                'image_url' => 'nullable|string',
                'images' => 'nullable|array',
                'images.*' => 'nullable|string',
                'measurements' => 'nullable|array',
                'measurements.*.name' => 'nullable|string|max:100',
                'measurements.*.value' => 'nullable|string|max:100',
                'measurements.*.unit' => 'nullable|string|max:20',
                'measurements.*.price_adjustment' => 'nullable|numeric',
                'measurements.*.stock' => 'nullable|integer|min:0',
                'measurements.*.is_default' => 'nullable|boolean',
                'weight' => 'nullable|string',
            ]);
            
            if ($validator->fails()) {
                Log::error('Product update validation failed:', [
                    'errors' => $validator->errors()->toArray()
                ]);
                return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
            }
            
            // Generate slug if name changed
            $slug = $product->slug;
            if ($request->name !== $product->name) {
                $slug = Str::slug($request->name);
            }
            
            // Handle product image
            $productImage = $product->image_url;
            $imageUpdated = false;
            
            Log::info('Image URL handling:', [
                'has_image_url' => $request->has('image_url'),
                'request_image_url' => $request->image_url,
                'product_image_url' => $product->image_url
            ]);
            
            // Always update the image_url if it's provided in the request
            if ($request->image_url !== null) {
                $productImage = $request->image_url;
                $imageUpdated = true;
                
                // If image_url is updated, also update or create a related primary image record
                if ($productImage) {
                    // Check if a primary image already exists
                    $primaryImage = $product->images()->where('is_primary', true)->first();
                    
                    if ($primaryImage) {
                        // Update existing primary image
                        $primaryImage->update([
                            'image_path' => $productImage
                        ]);
                    } else {
                        // Create new primary image
                        $product->images()->create([
                            'image_path' => $productImage,
                            'is_primary' => true,
                            'sort_order' => 0
                        ]);
                    }
                    
                    // Refresh the product to ensure the relationship is loaded correctly
                    $product = $product->fresh();
                }
            }
            
            // Update product
            $updateData = [
                'name' => $request->name,
                'slug' => $slug,
                'base_price' => $requestData['base_price'],
                'stock_quantity' => $requestData['stock_quantity'],
                'sku' => $request->sku,
                'category_id' => $request->category_id,
                'is_active' => $request->boolean('is_active', true),
                'is_featured' => $request->boolean('is_featured', false),
                'image_url' => $productImage
            ];

            // Only add fields if they are present in the request
            if ($request->has('description')) {
                $updateData['description'] = $request->description;
            }
            
            if ($request->has('short_description')) {
                $updateData['short_description'] = $request->short_description;
            }
            
            if ($request->has('sale_price')) {
                $updateData['sale_price'] = $request->sale_price;
            }
            
            if ($request->has('barcode')) {
                $updateData['barcode'] = $request->barcode;
            }
            
            if ($request->has('brand')) {
                $updateData['brand'] = $request->brand;
            }
            
            if ($request->has('expiry_date')) {
                $updateData['expiry_date'] = $request->expiry_date;
            }
            
            if ($request->has('meta_data')) {
                $updateData['meta_data'] = $request->meta_data;
            }
            
            if ($request->has('total_sold')) {
                $updateData['total_sold'] = $request->total_sold;
            }
            
            if ($request->has('weight')) {
                $updateData['weight'] = $request->weight;
            }
            
            // Boolean flags
            if ($request->has('is_new_arrival')) {
                $updateData['is_new_arrival'] = $request->boolean('is_new_arrival');
            }
            
            if ($request->has('is_hot_deal')) {
                $updateData['is_hot_deal'] = $request->boolean('is_hot_deal');
            }
            
            if ($request->has('is_best_seller')) {
                $updateData['is_best_seller'] = $request->boolean('is_best_seller');
            }
            
            if ($request->has('is_expiring_soon')) {
                $updateData['is_expiring_soon'] = $request->boolean('is_expiring_soon');
            }
            
            if ($request->has('is_clearance')) {
                $updateData['is_clearance'] = $request->boolean('is_clearance');
            }
            
            if ($request->has('is_recommended')) {
                $updateData['is_recommended'] = $request->boolean('is_recommended');
            }
            
            // Update the product with the filtered data
            $product->update($updateData);
            
            // Create measurements if provided
            if ($request->has('measurements')) {
                foreach ($request->measurements as $measurementData) {
                    $product->measurements()->create([
                        'name' => $measurementData['name'],
                        'value' => $measurementData['value'],
                        'unit' => $measurementData['unit'] ?? null,
                        'price' => $product->base_price + ($measurementData['price_adjustment'] ?? 0),
                        'sale_price' => $product->sale_price ? ($product->sale_price + ($measurementData['price_adjustment'] ?? 0)) : null,
                        'stock_quantity' => $measurementData['stock'] ?? $product->stock_quantity,
                        'sku' => $product->sku . '-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $measurementData['name']), 0, 3)),
                        'is_default' => $measurementData['is_default'] ?? false,
                        'is_active' => true,
                    ]);
                }
            }

            // Create additional images if provided
            if ($request->has('images')) {
                foreach ($request->images as $imageUrl) {
                    // Handle image URL or base64
                    $finalImageUrl = $imageUrl;
                    if (strpos($imageUrl, 'data:image') === 0) {
                        // Handle base64 encoded image
                        $finalImageUrl = $this->uploadBase64Image($imageUrl, $request->sku . '-' . uniqid());
                    }
                    
                    $product->images()->create([
                        'image_path' => $finalImageUrl,
                        'is_primary' => false,
                        'sort_order' => 0
                    ]);
                }
            }

            // Clear cache after updating a product
            $this->clearProductCache();

            // Refresh the product model to get the latest data
            $product = Product::with('category', 'measurements', 'images')->find($product->id);

            return response()->json(['message' => 'Product updated successfully', 'product' => $product]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update product: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified product from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        DB::beginTransaction();

        try {
            // Delete related measurements
            $product->measurements()->delete();

            // Delete related images
            $product->images()->delete();

            // Delete the product
            $product->delete();

            DB::commit();

            // Clear cache after deleting a product
            $this->clearProductCache();

            return response()->json([
                'message' => 'Product deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete product: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Toggle the featured status of a product.
     *
     * @param  int  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function toggleFeatured($id, Request $request)
    {
        try {
            $product = Product::findOrFail($id);
            
            // Update the featured status based on the request or toggle the current value
            $isFeatured = $request->has('is_featured') 
                ? $request->boolean('is_featured') 
                : !$product->is_featured;
            
            $product->is_featured = $isFeatured;
            $product->save();
            
            // Clear cache after updating a product
            $this->clearProductCache();
            
            return response()->json([
                'message' => 'Product featured status updated successfully',
                'product' => $product->fresh(['category', 'measurements'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update product featured status: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Toggle the active status of a product.
     *
     * @param  int  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function toggleStatus($id, Request $request)
    {
        try {
            $product = Product::findOrFail($id);
            
            // Update the active status based on the request or toggle the current value
            $isActive = $request->has('is_active') 
                ? $request->boolean('is_active') 
                : !$product->is_active;
            
            $product->is_active = $isActive;
            $product->save();
            
            // Clear cache after updating a product
            $this->clearProductCache();
            
            return response()->json([
                'message' => 'Product active status updated successfully',
                'product' => $product->fresh(['category', 'measurements'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update product active status: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Bulk delete products.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_ids' => 'required|array',
            'product_ids.*' => 'required|integer|exists:products,id'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }
        
        DB::beginTransaction();
        
        try {
            $products = Product::whereIn('id', $request->product_ids)->get();
            
            foreach ($products as $product) {
                // Delete related measurements
                $product->measurements()->delete();
                
                // Delete related images
                $product->images()->delete();
                
                // Delete the product
                $product->delete();
            }
            
            DB::commit();
            
            // Clear cache after bulk deleting products
            $this->clearProductCache();
            
            return response()->json([
                'message' => count($request->product_ids) . ' products deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete products: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Bulk update featured status for products.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function bulkFeature(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_ids' => 'required|array',
            'product_ids.*' => 'required|integer|exists:products,id',
            'is_featured' => 'required|boolean'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }
        
        try {
            $count = Product::whereIn('id', $request->product_ids)
                ->update(['is_featured' => $request->boolean('is_featured')]);
            
            // Clear cache after bulk updating products
            $this->clearProductCache();
            
            return response()->json([
                'message' => $count . ' products updated successfully',
                'is_featured' => $request->boolean('is_featured')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update products: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Bulk update active status for products.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function bulkStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_ids' => 'required|array',
            'product_ids.*' => 'required|integer|exists:products,id',
            'is_active' => 'required|boolean'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }
        
        try {
            $count = Product::whereIn('id', $request->product_ids)
                ->update(['is_active' => $request->boolean('is_active')]);
            
            // Clear cache after bulk updating products
            $this->clearProductCache();
            
            return response()->json([
                'message' => $count . ' products updated successfully',
                'is_active' => $request->boolean('is_active')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update products: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload a base64 encoded image to Cloudinary.
     *
     * @param string $base64Image
     * @param string $publicId
     * @return string
     */
    private function uploadBase64Image(string $base64Image, string $publicId): string
    {
        return $this->cloudinaryService->uploadBase64Image($base64Image, $publicId);
    }

    /**
     * Generate a placeholder image URL based on product name.
     *
     * @param string $productName
     * @return string
     */
    private function generatePlaceholderImage(string $productName): string
    {
        // Format the product name for the placeholder text
        $text = str_replace(' ', '\n', $productName);
        
        // Generate a placeholder image URL with the product name as text
        return $this->cloudinaryService->generatePlaceholderUrl($text);
    }
}
