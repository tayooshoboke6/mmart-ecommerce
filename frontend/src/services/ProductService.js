import api from './api';

/**
 * ProductService provides methods for interacting with the product-related API endpoints
 * It uses the api wrapper for consistent error handling and configuration
 */
const ProductService = {
  /**
   * Get featured products
   * @returns {Promise} Promise that resolves to the API response
   */
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/products/by-type/featured');
      return response;
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return { data: { products: [] } };
    }
  },

  /**
   * Get new arrivals
   * @returns {Promise} Promise that resolves to the API response
   */
  getNewArrivals: async () => {
    try {
      const response = await api.get('/products/by-type/new_arrivals');
      return response;
    } catch (error) {
      console.error("Error fetching new arrivals:", error);
      return { data: { products: [] } };
    }
  },

  /**
   * Get best sellers
   * @returns {Promise} Promise that resolves to the API response
   */
  getBestSellers: async () => {
    try {
      const response = await api.get('/products/by-type/best_sellers');
      return response;
    } catch (error) {
      console.error("Error fetching best sellers:", error);
      return { data: { products: [] } };
    }
  },

  /**
   * Get hot deals
   * @returns {Promise} Promise that resolves to the API response
   */
  getHotDeals: async () => {
    try {
      const response = await api.get('/products/by-type/hot_deals');
      return response;
    } catch (error) {
      console.error("Error fetching hot deals:", error);
      return { data: { products: [] } };
    }
  },

  /**
   * Get products expiring soon
   * @returns {Promise} Promise that resolves to the API response
   */
  getExpiringSoon: async () => {
    try {
      const response = await api.get('/products/by-type/expiring_soon');
      return response;
    } catch (error) {
      console.error("Error fetching expiring soon products:", error);
      return { data: { products: [] } };
    }
  },

  /**
   * Get all products with optional filters
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} Promise that resolves to the API response
   */
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      return { data: { products: [] } };
    }
  },

  /**
   * Get a single product by slug
   * @param {string} slug - Product slug
   * @returns {Promise} Promise that resolves to the API response
   */
  getProduct: async (slug) => {
    try {
      const response = await api.get(`/products/${slug}`);
      return response;
    } catch (error) {
      console.error(`Error fetching product ${slug}:`, error);
      return { data: {} };
    }
  },

  /**
   * Get related products for a product
   * @param {string} slug - Product slug
   * @returns {Promise} Promise that resolves to the API response
   */
  getRelatedProducts: async (slug) => {
    try {
      const response = await api.get(`/products/${slug}/related`);
      return response;
    } catch (error) {
      console.error(`Error fetching related products for ${slug}:`, error);
      return { data: { products: [] } };
    }
  },

  /**
   * Get products by category
   * @param {string} categorySlug - Category slug
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} Promise that resolves to the API response
   */
  getProductsByCategory: async (categorySlug, params = {}) => {
    try {
      const response = await api.get(`/categories/${categorySlug}/products`, { params });
      return response;
    } catch (error) {
      console.error(`Error fetching products for category ${categorySlug}:`, error);
      return { data: { products: [] } };
    }
  },

  /**
   * Get all categories
   * @returns {Promise} Promise that resolves to the API response
   */
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { data: { categories: [] } };
    }
  },

  /**
   * Get category tree structure
   * @returns {Promise} Promise that resolves to the API response
   */
  getCategoryTree: async () => {
    try {
      const response = await api.get('/categories/tree');
      return response;
    } catch (error) {
      console.error("Error fetching category tree:", error);
      return { data: [] };
    }
  },

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Promise that resolves to the API response
   */
  searchProducts: async (query, params = {}) => {
    try {
      const response = await api.get('/products/search', { 
        params: { 
          q: query,
          ...params
        } 
      });
      return response;
    } catch (error) {
      console.error(`Error searching products with query "${query}":`, error);
      return { data: { products: [] } };
    }
  },

  /**
   * Generic method to get products by type
   * @param {string} type - Product type (featured, new_arrivals, best_sellers, hot_deals, expiring_soon)
   * @returns {Promise} Promise that resolves to the API response
   */
  getProductsByType: async (type) => {
    try {
      const response = await api.get(`/products/by-type/${type}`);
      return response;
    } catch (error) {
      console.error(`Error fetching products by type ${type}:`, error);
      return { data: { products: [] } };
    }
  }
};

export default ProductService;
