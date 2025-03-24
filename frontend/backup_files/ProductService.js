import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ProductService {
  // Get featured products
  getFeaturedProducts() {
    return axios.get(`${API_URL}/products/featured`).catch(error => {
      console.error("Error fetching featured products:", error);
      return { data: [] };
    });
  }

  // Get new arrivals
  getNewArrivals() {
    return axios.get(`${API_URL}/products/new-arrivals`).catch(error => {
      console.error("Error fetching new arrivals:", error);
      return { data: [] };
    });
  }

  // Get best sellers
  getBestSellers() {
    return axios.get(`${API_URL}/products/best-sellers`).catch(error => {
      console.error("Error fetching best sellers:", error);
      return { data: [] };
    });
  }

  // Get categories
  getCategories() {
    return axios.get(`${API_URL}/categories`).catch(error => {
      console.error("Error fetching categories:", error);
      return { data: [] };
    });
  }

  // Get product details
  getProduct(slug) {
    return axios.get(`${API_URL}/products/${slug}`);
  }

  // Get products by category
  getProductsByCategory(categorySlug) {
    return axios.get(`${API_URL}/products/category/${categorySlug}`);
  }

  // Search products
  searchProducts(query) {
    return axios.get(`${API_URL}/products/search?q=${query}`);
  }
}

export default new ProductService();
