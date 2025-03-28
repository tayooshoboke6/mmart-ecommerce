import React from 'react';

/**
 * Skeleton loader component for product detail page
 * Shows a placeholder UI while product data is loading
 */
const ProductDetailSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image Skeleton */}
        <div className="md:w-1/2">
          <div className="bg-gray-200 rounded-lg h-96 w-full"></div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
        </div>
        
        {/* Product Info Skeleton */}
        <div className="md:w-1/2">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
          
          <div className="flex gap-4 mb-6">
            <div className="h-12 bg-gray-200 rounded w-32"></div>
            <div className="h-12 bg-gray-200 rounded w-48"></div>
          </div>
          
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        </div>
      </div>
      
      {/* Related Products Skeleton */}
      <div className="mt-12">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4">
              <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded-full w-8"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
