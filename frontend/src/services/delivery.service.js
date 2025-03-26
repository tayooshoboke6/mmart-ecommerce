import api from './api';

class DeliveryService {
  /**
   * Calculate delivery fee based on customer location and order subtotal
   * 
   * @param {number} latitude - Customer latitude
   * @param {number} longitude - Customer longitude
   * @param {number} subtotal - Order subtotal
   * @param {number|null} storeId - Optional store ID
   * @returns {Promise<Object>} Delivery fee calculation result
   */
  async calculateDeliveryFee(latitude, longitude, subtotal, storeId = null) {
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
        subtotal
      };
      
      if (storeId) {
        payload.store_id = storeId;
      }
      
      console.log('DeliveryService: Sending API request to:', '/delivery-fee/calculate');
      console.log('DeliveryService: Request payload:', payload);
      
      const response = await api.post('/delivery-fee/calculate', payload);
      
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
   * Get available pickup locations
   * 
   * @returns {Promise<Object>} Pickup locations
   */
  async getPickupLocations() {
    try {
      const response = await api.get('/pickup-locations');
      
      if (response.data.status === 'success') {
        return {
          success: true,
          locations: response.data.data
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to fetch pickup locations'
        };
      }
    } catch (error) {
      console.error('Error fetching pickup locations:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching pickup locations',
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
   * @returns {Promise<Object>} Result of the update operation
   */
  async updateAddressCoordinates(addressId, latitude, longitude) {
    try {
      console.log('DeliveryService: Updating address coordinates:', {
        addressId,
        latitude,
        longitude
      });
      
      const response = await api.patch(`/addresses/${addressId}/coordinates`, {
        latitude,
        longitude
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
