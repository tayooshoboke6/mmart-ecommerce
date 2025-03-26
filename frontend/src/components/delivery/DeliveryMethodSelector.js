import React, { useState, useEffect } from 'react';
import DeliveryService from '../../services/delivery.service';
import { formatNaira } from '../../utils/formatters';

const DeliveryMethodSelector = ({ 
  selectedAddress, 
  subtotal, 
  onDeliveryFeeCalculated, 
  selectedMethod, 
  onMethodChange, 
  setSelectedAddress 
}) => {
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState(null);

  // Fetch pickup locations on component mount
  useEffect(() => {
    const fetchPickupLocations = async () => {
      try {
        const response = await DeliveryService.getPickupLocations();
        if (response.success && response.locations && response.locations.length > 0) {
          setPickupLocations(response.locations);
          // Set first pickup location as default if available
          setSelectedPickupLocation(response.locations[0].id);
        } else {
          console.log('No pickup locations available or empty response:', response);
          setPickupLocations([]);
        }
      } catch (error) {
        console.error('Error fetching pickup locations:', error);
        setPickupLocations([]);
      }
    };

    fetchPickupLocations();
  }, []);

  // Fetch the selected address details when it changes
  useEffect(() => {
    if (selectedMethod === 'delivery' && selectedAddress) {
      console.log('Selected address details:', {
        id: selectedAddress.id,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
        raw: selectedAddress
      });
      
      // If address doesn't have coordinates, try to geocode it
      if (!selectedAddress.latitude || !selectedAddress.longitude) {
        console.log('Address missing coordinates, attempting to geocode');
        geocodeAddress(selectedAddress);
      } else {
        console.log('Address has coordinates, calculating delivery fee');
        calculateDeliveryFee();
      }
    }
  }, [selectedAddress, selectedMethod]);

  // Calculate delivery fee when subtotal changes
  useEffect(() => {
    if (selectedMethod === 'delivery' && selectedAddress && selectedAddress.latitude && selectedAddress.longitude) {
      calculateDeliveryFee();
    }
  }, [subtotal]);

  // Reset state when delivery method changes
  useEffect(() => {
    if (selectedMethod === 'pickup') {
      setDeliveryFee(0);
      setDeliveryInfo({
        fee: 0,
        estimatedDeliveryTime: null,
        isDeliveryAvailable: true
      });
      onDeliveryFeeCalculated(0, null);
    }
  }, [selectedMethod]);

  // Geocode the address to get coordinates
  const geocodeAddress = async (address) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Geocoding address:', address);
      
      // Construct address string for geocoding
      const addressString = `${address.street}, ${address.city}, ${address.state}, ${address.country}`;
      
      // Use browser's Geocoding API if available
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        
        geocoder.geocode({ address: addressString }, async (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            
            console.log('Successfully geocoded address:', {
              address: addressString,
              lat: location.lat(),
              lng: location.lng()
            });
            
            // Update the address with coordinates
            const updatedAddress = {
              ...selectedAddress,
              latitude: location.lat(),
              longitude: location.lng()
            };
            
            // Update the selected address in the component state
            setSelectedAddress(updatedAddress);
            
            // Also update the address in the database so we don't need to geocode again
            try {
              const response = await DeliveryService.updateAddressCoordinates(
                updatedAddress.id,
                location.lat(),
                location.lng()
              );
              
              if (response.success) {
                console.log('Successfully updated address coordinates in database');
              } else {
                console.warn('Failed to update address coordinates in database:', response.message);
              }
            } catch (error) {
              console.error('Error updating address coordinates in database:', error);
            }
            
            // Calculate delivery fee with the new coordinates
            calculateDeliveryFeeWithCoordinates(location.lat(), location.lng());
          } else {
            console.error('Geocoding failed:', status);
            setError('Could not find coordinates for this address. Please select a different address.');
            setLoading(false);
          }
        });
      } else {
        console.error('Google Maps API not available');
        setError('Unable to calculate delivery fee. Google Maps is not available.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error during geocoding:', error);
      setError('Error calculating delivery fee. Please try again later.');
      setLoading(false);
    }
  };

  const calculateDeliveryFeeWithCoordinates = async (latitude, longitude) => {
    try {
      const response = await DeliveryService.calculateDeliveryFee(
        latitude,
        longitude,
        subtotal
      );

      if (response.success) {
        const data = response.data;
        setDeliveryFee(data.fee);
        setDeliveryInfo(data);
        onDeliveryFeeCalculated(data.fee, data);
      } else {
        setError('Failed to calculate delivery fee');
        onDeliveryFeeCalculated(0, null);
      }
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      setError(error.response?.data?.message || 'Error calculating delivery fee');
      onDeliveryFeeCalculated(0, null);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryFee = async () => {
    console.log('Starting delivery fee calculation with address:', selectedAddress);
    
    if (!selectedAddress || !selectedAddress.latitude || !selectedAddress.longitude) {
      console.error('Invalid address data:', selectedAddress);
      setError('Invalid address information. Please select a valid address.');
      return;
    }

    console.log('Using coordinates for delivery calculation:', {
      latitude: selectedAddress.latitude,
      longitude: selectedAddress.longitude,
      subtotal: subtotal
    });
    
    setLoading(true);
    setError(null);

    try {
      const response = await DeliveryService.calculateDeliveryFee(
        selectedAddress.latitude,
        selectedAddress.longitude,
        subtotal
      );
      
      console.log('Delivery fee calculation response:', response);

      if (response.success) {
        const data = response.data;
        console.log('Delivery fee calculation successful:', data);
        setDeliveryFee(data.fee);
        setDeliveryInfo(data);
        onDeliveryFeeCalculated(data.fee, data);
      } else {
        console.error('Delivery fee calculation failed:', response.message);
        setError('Failed to calculate delivery fee');
        onDeliveryFeeCalculated(0, null);
      }
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      setError(error.response?.data?.message || 'Error calculating delivery fee');
      onDeliveryFeeCalculated(0, null);
    } finally {
      setLoading(false);
    }
  };

  const handlePickupLocationChange = (e) => {
    setSelectedPickupLocation(parseInt(e.target.value));
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Delivery Method</h3>
      
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="deliveryMethod"
              value="delivery"
              checked={selectedMethod === 'delivery'}
              onChange={() => onMethodChange('delivery')}
              className="mr-2"
            />
            <span>Delivery</span>
          </label>
          
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="deliveryMethod"
              value="pickup"
              checked={selectedMethod === 'pickup'}
              onChange={() => onMethodChange('pickup')}
              className="mr-2"
            />
            <span>Pickup</span>
          </label>
        </div>

        {selectedMethod === 'delivery' && (
          <div className="pl-4">
            {loading && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                <span className="text-sm">Calculating delivery fee...</span>
              </div>
            )}
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            
            {deliveryInfo && (
              <div className="text-sm">
                {deliveryInfo.isDeliveryAvailable && deliveryInfo.estimatedTime > 0 && (
                  <p className="text-green-600">
                    Estimated delivery time: Under {deliveryInfo.estimatedTime} minutes
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {selectedMethod === 'pickup' && (
          <div className="pl-6">
            {pickupLocations.length === 0 ? (
              <p className="text-red-500 text-sm">No pickup locations available</p>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Pickup Location
                </label>
                <select
                  value={selectedPickupLocation || ''}
                  onChange={handlePickupLocationChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {pickupLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.address_line1}, {location.city}
                    </option>
                  ))}
                </select>
                
                {selectedPickupLocation && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="font-semibold">Pickup Instructions:</p>
                    <p>Please bring your order confirmation and ID for pickup.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryMethodSelector;
