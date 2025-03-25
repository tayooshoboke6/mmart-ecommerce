import api from './api';

const CartService = {
  // Get cart items
  getCartItems: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Add item to cart
  addToCart: async (item) => {
    try {
      console.log('CartService addToCart - Item to be sent to API:', item);
      const response = await api.post('/cart/add', item);
      console.log('CartService addToCart - API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('CartService addToCart - API error:', error);
      throw error.response ? error.response.data : error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/update/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Remove item from cart
  removeCartItem: async (itemId) => {
    try {
      const response = await api.delete(`/cart/remove/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await api.delete('/cart/clear');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default CartService;
