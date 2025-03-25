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
      // Extract the numeric ID from the order number
      // First check if it's already a numeric ID
      let orderId = orderNumber;
      
      // If it's not numeric, try to extract the ID
      if (isNaN(parseInt(orderNumber))) {
        // Check if the order number contains the ID at the end
        const matches = orderNumber.match(/\d+$/);
        if (matches && matches.length > 0) {
          orderId = matches[0];
        } else if (orderNumber.includes('-')) {
          // Try to extract ID from formats like ORD-UHPD4FZTNI
          const parts = orderNumber.split('-');
          orderId = parts[parts.length - 1];
        }
      }
      
      console.log('Extracted order ID:', orderId);
      
      // Use the regular getOrder method with the extracted ID
      const response = await api.get(`/orders/${orderId}`);
      
      // Ensure we have a consistent response format
      let orderData = response.data;
      
      // If the response has an 'order' property, use that
      if (orderData.order) {
        orderData = orderData.order;
      }
      
      // Ensure order_number is set
      if (!orderData.order_number && orderNumber) {
        orderData.order_number = orderNumber;
      }
      
      console.log('Processed order data from API:', orderData);
      
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
