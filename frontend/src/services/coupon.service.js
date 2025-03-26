import api from './api';

class CouponService {
  /**
   * Validate a coupon code
   * @param {string} code - The coupon code to validate
   * @param {number} subtotal - The current cart subtotal
   * @param {Array} items - Cart items to check for category/product restrictions
   * @returns {Promise} Response with coupon details if valid
   */
  static async validateCoupon(code, subtotal, items = []) {
    try {
      const response = await api.post('/coupons/validate', {
        code,
        order_amount: subtotal,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.price
        }))
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default CouponService;
