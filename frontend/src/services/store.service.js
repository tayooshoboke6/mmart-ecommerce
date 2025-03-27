import axios from 'axios';
import { API_URL } from '../config';

class StoreService {
  async findNearestStore({ latitude, longitude }) {
    try {
      console.log('=== Finding Nearest Store ===');
      console.log('Request:', {
        endpoint: `${API_URL}/api/pickup-locations/nearest`,
        body: { latitude, longitude }
      });

      const response = await axios.post(`${API_URL}/api/pickup-locations/nearest`, {
        latitude,
        longitude
      });
      
      console.log('=== Backend Response ===');
      console.log('Status:', response.status);
      console.log('Full response:', response.data);
      
      // Get the first store from the response if exists
      const storeData = response.data?.data?.[0];
      
      if (!storeData) {
        console.log('=== No Store Found ===');
        console.log('Returning:', {
          store: null,
          isDeliveryAvailable: false,
          isPickupAvailable: false,
          distance: 0
        });

        return {
          store: null,
          isDeliveryAvailable: false,
          isPickupAvailable: false,
          distance: 0
        };
      }

      const { location, distance } = storeData;
      
      console.log('=== Store Found ===');
      console.log('Store details:', {
        id: location.id,
        name: location.name,
        address: location.formatted_address,
        isDelivery: location.is_delivery_location,
        isPickup: location.is_pickup_location,
        distance,
        deliveryRadius: location.delivery_radius_km,
        baseFee: location.delivery_base_fee,
        feePerKm: location.delivery_fee_per_km
      });

      const result = {
        store: location,
        isDeliveryAvailable: location.is_delivery_location,
        isPickupAvailable: location.is_pickup_location,
        distance
      };

      console.log('=== Returning Result ===');
      console.log('Result:', result);

      return result;
    } catch (error) {
      console.error('=== Error Finding Store ===');
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data
      });

      return {
        store: null,
        isDeliveryAvailable: false,
        isPickupAvailable: false,
        distance: 0
      };
    }
  }
}

export default new StoreService();
