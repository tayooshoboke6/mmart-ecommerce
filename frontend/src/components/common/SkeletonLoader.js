import React from 'react';

/**
 * Skeleton loader component for different UI elements
 * Shows a placeholder UI while content is loading
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Type of skeleton (product, category, banner)
 * @param {number} props.count - Number of skeleton items to show
 */
const SkeletonLoader = ({ type = 'product', count = 1 }) => {
  const renderSkeletons = () => {
    const skeletons = [];
    
    for (let i = 0; i < count; i++) {
      if (type === 'product') {
        skeletons.push(
          <div key={`product-skeleton-${i}`} className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
            <div className="h-40 bg-gray-200 rounded-md mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-7 bg-gray-200 rounded-full w-7"></div>
            </div>
          </div>
        );
      } else if (type === 'category') {
        skeletons.push(
          <div key={`category-skeleton-${i}`} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
            <div className="h-32 bg-gray-200 mb-2"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        );
      } else if (type === 'banner') {
        skeletons.push(
          <div key={`banner-skeleton-${i}`} className="w-full h-64 bg-gray-200 rounded-lg animate-pulse flex">
            <div className="w-1/2 p-8">
              <div className="h-5 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-10 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-10 bg-gray-300 rounded w-3/4 mb-6"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-6"></div>
              <div className="h-10 bg-gray-300 rounded w-1/3"></div>
            </div>
            <div className="w-1/2"></div>
          </div>
        );
      }
    }
    
    return skeletons;
  };
  
  if (type === 'banner') {
    return (
      <div className="w-full">
        {renderSkeletons()}
      </div>
    );
  }
  
  return (
    <div className={`grid ${type === 'product' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4'}`}>
      {renderSkeletons()}
    </div>
  );
};

export default SkeletonLoader;
