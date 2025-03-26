import api from './api';

class AddressService {
  /**
   * Get all addresses for a user
   * @param {number} userId - The user ID
   * @returns {Promise} - Promise with the addresses data
   */
  async getUserAddresses(userId) {
    try {
      const response = await api.get(`/users/${userId}/addresses`);
      return {
        addresses: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      throw error;
    }
  }

  /**
   * Add a new address for a user
   * @param {number} userId - The user ID
   * @param {object} addressData - The address data
   * @returns {Promise} - Promise with the created address or error
   */
  async addAddress(userId, addressData) {
    try {
      const response = await api.post(`/users/${userId}/addresses`, addressData);
      return {
        success: true,
        address: response.data.data
      };
    } catch (error) {
      console.error('Error adding address:', error);
      // Check if this is the max addresses reached error
      if (error.response && error.response.data && error.response.data.max_reached) {
        return {
          success: false,
          maxReached: true,
          message: error.response.data.message
        };
      }
      throw error;
    }
  }

  /**
   * Update an existing address
   * @param {number} userId - The user ID
   * @param {number} addressId - The address ID
   * @param {object} addressData - The updated address data
   * @returns {Promise} - Promise with the updated address or error
   */
  async updateAddress(userId, addressId, addressData) {
    try {
      const response = await api.put(`/users/${userId}/addresses/${addressId}`, addressData);
      return {
        success: true,
        address: response.data.data
      };
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  /**
   * Get a specific address by ID
   * @param {number} addressId - The address ID
   * @returns {Promise} - Promise with the address data
   */
  async getAddress(addressId) {
    try {
      // Get the current user ID from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id;
      
      if (!userId) {
        return {
          success: false,
          message: 'User not authenticated'
        };
      }
      
      const response = await api.get(`/users/${userId}/addresses/${addressId}`);
      return {
        success: true,
        address: response.data.data
      };
    } catch (error) {
      console.error('Error fetching address details:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching address details'
      };
    }
  }

  /**
   * Delete an address
   * @param {number} userId - The user ID
   * @param {number} addressId - The address ID to delete
   * @returns {Promise} - Promise with the deletion result
   */
  async deleteAddress(userId, addressId) {
    try {
      const response = await api.delete(`/users/${userId}/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  /**
   * Set an address as the default address
   * @param {number} userId - The user ID
   * @param {number} addressId - The address ID to set as default
   * @returns {Promise} - Promise with the result
   */
  async setDefaultAddress(userId, addressId) {
    try {
      const response = await api.patch(`/users/${userId}/addresses/${addressId}/default`);
      return response.data;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }
}

export default new AddressService();
