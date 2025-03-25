import api from './api';

const OrderService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get user orders
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get order details
  getOrder: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      
      // Ensure we have a consistent response format
      let orderData = response.data;
      
      // If the response has a 'data' property, use that
      if (orderData.data) {
        orderData = orderData.data;
      }
      
      // If the response has an 'order' property, use that
      if (orderData.order) {
        orderData = orderData.order;
      }
      
      console.log('Processed order data from getOrder:', orderData);
      
      return orderData;
    } catch (error) {
      console.error('Error in getOrder:', error);
      throw error.response ? error.response.data : error;
    }
  },

  // Get order details by order number
  getOrderByNumber: async (orderNumber) => {
    try {
      // Use the order number directly with the backend API
      const response = await api.get(`/orders/${orderNumber}`);
      
      // Ensure we have a consistent response format
      let orderData = response.data;
      
      // If the response has a 'data' property, use that
      if (orderData.data) {
        orderData = orderData.data;
      }
      
      // If the response has an 'order' property, use that
      if (orderData.order) {
        orderData = orderData.order;
      }
      
      console.log('Processed order data from getOrderByNumber:', orderData);
      
      return orderData;
    } catch (error) {
      console.error('Error in getOrderByNumber:', error);
      throw error.response ? error.response.data : error;
    }
  },

  // Cancel an order
  cancelOrder: async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get pickup details for an order
  getPickupDetails: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/pickup-details`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Process payment for an order
  processPayment: async (orderId, paymentData) => {
    try {
      const response = await api.post(`/orders/${orderId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Verify payment status
  verifyPayment: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}/verify`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Validate coupon code
  validateCoupon: async (couponCode) => {
    try {
      const response = await api.post('/coupons/validate', { code: couponCode });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Calculate delivery fee
  calculateDeliveryFee: async (deliveryData) => {
    try {
      const response = await api.post('/delivery-fee/calculate', deliveryData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default OrderService;
