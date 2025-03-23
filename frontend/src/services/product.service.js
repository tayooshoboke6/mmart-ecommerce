import api from './api';

const ProductService = {
  // Get all products with optional filters
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get a single product by ID or slug
  getProduct: async (idOrSlug) => {
    try {
      const response = await api.get(`/products/${idOrSlug}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get category tree structure
  getCategoryTree: async () => {
    try {
      const response = await api.get('/categories/tree');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get a single category by ID or slug
  getCategory: async (idOrSlug) => {
    try {
      const response = await api.get(`/categories/${idOrSlug}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get products in a category
  getCategoryProducts: async (categoryIdOrSlug, params = {}) => {
    try {
      const response = await api.get(`/categories/${categoryIdOrSlug}/products`, { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get product sections (featured, new arrivals, etc.)
  getProductSections: async () => {
    try {
      const response = await api.get('/product-sections');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get products by type (featured, new, bestseller, etc.)
  getProductsByType: async (type) => {
    try {
      const response = await api.get(`/products/by-type/${type}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default ProductService;
