import api from '../services/api';

// Simple in-memory cache
const cache = {
  data: {},
  timestamp: {},
  maxAge: 60000, // 1 minute default cache time
};

/**
 * Prefetch data and store in memory cache
 * @param {string} url - API endpoint to prefetch
 * @param {number} maxAge - Maximum age of cache in milliseconds
 * @returns {Promise} - Promise that resolves with the data
 */
export const prefetchData = async (url, maxAge = 60000) => {
  try {
    // Set cache max age for this URL
    cache.maxAge = maxAge;
    
    // Make API request in the background
    const response = await api.get(url);
    
    // Extract the data array based on the endpoint
    let extractedData;
    if (url.includes('/products/')) {
      extractedData = response.data && response.data.products ? response.data.products : [];
    } else if (url.includes('/categories')) {
      extractedData = response.data && response.data.categories ? response.data.categories : [];
    } else {
      extractedData = response.data;
    }
    
    // Store in cache
    cache.data[url] = extractedData;
    cache.timestamp[url] = Date.now();
    
    return extractedData;
  } catch (error) {
    console.error(`Error prefetching ${url}:`, error);
    throw error;
  }
};

/**
 * Get data from cache or fetch if not available/expired
 * @param {string} url - API endpoint to get data from
 * @param {number} maxAge - Maximum age of cache in milliseconds
 * @returns {Promise} - Promise that resolves with the data
 */
export const getCachedData = async (url, maxAge = 60000) => {
  // If data exists in cache and is not expired
  if (
    cache.data[url] && 
    cache.timestamp[url] && 
    Date.now() - cache.timestamp[url] < maxAge
  ) {
    return cache.data[url];
  }
  
  // Otherwise fetch fresh data
  return prefetchData(url, maxAge);
};

/**
 * Prefetch common data that might be needed soon
 */
export const prefetchCommonData = () => {
  // Prefetch all product sections
  prefetchData('/products/by-type/featured', 300000); // 5 minutes
  prefetchData('/products/by-type/new_arrivals', 300000); // 5 minutes
  prefetchData('/products/by-type/best_sellers', 300000); // 5 minutes
  prefetchData('/products/by-type/hot_deals', 300000); // 5 minutes
  
  // Prefetch categories
  prefetchData('/categories', 600000); // 10 minutes
};

export default {
  prefetchData,
  getCachedData,
  prefetchCommonData,
};
