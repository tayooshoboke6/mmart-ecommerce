import axios from 'axios';
import { API_URL } from '../config';

class DeliveryService {
  /**
   * Calculate delivery fee based on customer location and order subtotal
   * 
   * @param {number} latitude - Customer latitude
   * @param {number} longitude - Customer longitude
   * @param {number} subtotal - Order subtotal
   * @param {number} storeId - Store ID
   * @returns {Promise<Object>} Delivery fee calculation result
   */
  async calculateDeliveryFee(latitude, longitude, subtotal, storeId) {
    try {
      console.log('DeliveryService: Calculating delivery fee with params:', {
        latitude,
        longitude,
        subtotal,
        storeId
      });

      const payload = {
        latitude,
        longitude,
        subtotal,
        store_id: storeId
      };
      
      console.log('DeliveryService: Sending API request to:', '/api/delivery-fee/calculate');
      console.log('DeliveryService: Request payload:', payload);
      
      const response = await axios.post(`${API_URL}/api/delivery-fee/calculate`, payload);
      
      console.log('DeliveryService: Received API response:', response.data);
      
      if (response.data.status === 'success') {
        // Debug the response data in detail
        console.log('DeliveryService: SUCCESS - Fee details:', {
          fee: response.data.data.fee,
          distance: response.data.data.distance,
          message: response.data.data.message,
          isDeliveryAvailable: response.data.data.isDeliveryAvailable,
          estimatedTime: response.data.data.estimatedTime
        });
        
        // Force delivery to be available for testing
        if (response.data.data.message && response.data.data.message.includes("don't currently deliver")) {
          console.log('DeliveryService: Overriding delivery availability for testing');
          response.data.data.isDeliveryAvailable = true;
          response.data.data.fee = 2000; // Base fee
          response.data.data.message = "Delivery fee: ₦2,000";
        }
        
        return {
          success: true,
          data: response.data.data
        };
      } else {
        console.error('DeliveryService: API returned error:', response.data);
        return {
          success: false,
          message: response.data.message || 'Failed to calculate delivery fee'
        };
      }
    } catch (error) {
      console.error('DeliveryService: Error calculating delivery fee:', error);
      console.error('DeliveryService: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return {
        success: false,
        message: error.response?.data?.message || 'Error calculating delivery fee',
        error
      };
    }
  }
  
  /**
   * Get store information from local storage or context
   * 
   * @param {number} storeId - Store ID
   * @returns {Object|null} Store information
   */
  getStoreInfo(storeId) {
    try {
      // Try to get from localStorage first
      const storesJson = localStorage.getItem('nearestStores');
      if (storesJson) {
        const stores = JSON.parse(storesJson);
        const store = stores.find(s => s.location?.id === storeId);
        if (store) {
          return store.location;
        }
      }
      
      // Fallback to default store info
      return {
        id: 1,
        name: 'Lekki Store',
        latitude: 6.4441339,
        longitude: 3.4910538,
        delivery_radius_km: -1,
        delivery_base_fee: 1500,
        delivery_fee_per_km: 100,
        free_delivery_threshold: 10000000,
        minimum_order_value: 10
      };
    } catch (error) {
      console.error('DeliveryService: Error getting store info:', error);
      return null;
    }
  }
  
  /**
   * Calculate distance between two points using Haversine formula
   * 
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lon1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lon2 - Longitude of point 2
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  }
  
  /**
   * Convert degrees to radians
   * 
   * @param {number} deg - Degrees
   * @returns {number} Radians
   */
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Validate delivery zone based on customer location and store ID
   * 
   * @param {number} latitude - Customer latitude
   * @param {number} longitude - Customer longitude
   * @param {number} storeId - Store ID
   * @returns {Promise<Object>} Delivery zone validation result
   */
  async validateDeliveryZone(latitude, longitude, storeId) {
    try {
      console.log('DeliveryService: Validating delivery zone with params:', {
        latitude,
        longitude,
        storeId
      });

      const payload = {
        latitude,
        longitude,
        store_id: storeId
      };
      
      console.log('DeliveryService: Sending API request to:', '/api/delivery-fee/validate-zone');
      console.log('DeliveryService: Request payload:', payload);
      
      const response = await axios.post(`${API_URL}/api/delivery-fee/validate-zone`, payload);
      
      console.log('DeliveryService: Received API response:', response.data);
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        console.error('DeliveryService: API returned error:', response.data);
        return {
          success: false,
          message: response.data.message || 'Failed to validate delivery zone'
        };
      }
    } catch (error) {
      console.error('DeliveryService: Error validating delivery zone:', error);
      console.error('DeliveryService: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return {
        success: false,
        message: error.response?.data?.message || 'Error validating delivery zone',
        error
      };
    }
  }

  /**
   * Get estimated delivery time based on customer location and store ID
   * 
   * @param {number} latitude - Customer latitude
   * @param {number} longitude - Customer longitude
   * @param {number} storeId - Store ID
   * @returns {Promise<Object>} Estimated delivery time
   */
  async getEstimatedDeliveryTime(latitude, longitude, storeId) {
    try {
      console.log('DeliveryService: Getting estimated delivery time with params:', {
        latitude,
        longitude,
        storeId
      });

      const payload = {
        latitude,
        longitude,
        store_id: storeId
      };
      
      console.log('DeliveryService: Sending API request to:', '/api/delivery-fee/estimate-time');
      console.log('DeliveryService: Request payload:', payload);
      
      const response = await axios.post(`${API_URL}/api/delivery-fee/estimate-time`, payload);
      
      console.log('DeliveryService: Received API response:', response.data);
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        console.error('DeliveryService: API returned error:', response.data);
        return {
          success: false,
          message: response.data.message || 'Failed to get estimated delivery time'
        };
      }
    } catch (error) {
      console.error('DeliveryService: Error getting estimated delivery time:', error);
      console.error('DeliveryService: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return {
        success: false,
        message: error.response?.data?.message || 'Error getting estimated delivery time',
        error
      };
    }
  }

  /**
   * Update address coordinates in the database
   * 
   * @param {number} addressId - Address ID
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @param {number} storeId - Store ID
   * @returns {Promise<Object>} Result of the update operation
   */
  async updateAddressCoordinates(addressId, latitude, longitude, storeId) {
    try {
      console.log('DeliveryService: Updating address coordinates:', {
        addressId,
        latitude,
        longitude,
        storeId
      });
      
      const response = await axios.patch(`${API_URL}/api/addresses/${addressId}/coordinates`, {
        latitude,
        longitude,
        store_id: storeId
      });
      
      console.log('DeliveryService: Address coordinates update response:', response.data);
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update address coordinates'
        };
      }
    } catch (error) {
      console.error('DeliveryService: Error updating address coordinates:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error updating address coordinates',
        error
      };
    }
  }
}

export default new DeliveryService();
