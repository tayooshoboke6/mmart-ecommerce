import React, { useState, useEffect } from 'react';
import DeliveryService from '../../services/delivery.service';
import StoreService from '../../services/store.service';
import { formatNaira } from '../../utils/formatters';

const DeliveryMethodSelector = ({ 
  selectedAddress, 
  subtotal, 
  onDeliveryFeeCalculated, 
  selectedMethod, 
  onMethodChange, 
  setSelectedAddress 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [nearestStore, setNearestStore] = useState(null);
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(false);
  const [isPickupAvailable, setIsPickupAvailable] = useState(false);

  // Check delivery availability when address changes
  useEffect(() => {
    const checkDeliveryAvailability = async () => {
      if (!selectedAddress) {
        console.log('No address selected, resetting delivery options');
        setIsDeliveryAvailable(false);
        setIsPickupAvailable(false);
        setNearestStore(null);
        return;
      }

      try {
        const { latitude, longitude } = selectedAddress;
        console.log('Checking delivery for address:', {
          address: selectedAddress.street,
          latitude,
          longitude
        });

        const { store, isDeliveryAvailable, isPickupAvailable, distance } = await StoreService.findNearestStore({ 
          latitude, 
          longitude 
        });

        console.log('Store availability check result:', {
          storeName: store?.name,
          isDeliveryAvailable,
          isPickupAvailable,
          distance,
          store
        });

        setNearestStore(store);
        setIsDeliveryAvailable(isDeliveryAvailable);
        setIsPickupAvailable(isPickupAvailable);
      } catch (error) {
        console.error('Error checking delivery availability:', error);
        setError('Failed to check delivery availability');
        setIsDeliveryAvailable(false);
        setIsPickupAvailable(false);
        setNearestStore(null);
      }
    };

    console.log('Address changed, checking delivery availability');
    checkDeliveryAvailability();
  }, [selectedAddress]);

  // Calculate delivery fee when method or address changes
  useEffect(() => {
    const calculateDeliveryFee = async () => {
      console.log('Calculating delivery fee:', {
        method: selectedMethod,
        hasAddress: !!selectedAddress,
        isDeliveryAvailable,
        hasStore: !!nearestStore,
        subtotal
      });

      if (selectedMethod !== 'delivery' || !selectedAddress || !isDeliveryAvailable || !nearestStore) {
        console.log('Skipping delivery fee calculation - conditions not met');
        setDeliveryFee(0);
        onDeliveryFeeCalculated(0, null);
        return;
      }

      setLoading(true);
      setError('');

      try {
        console.log('Calculating fee for:', {
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude,
          subtotal,
          storeId: nearestStore.id
        });

        const response = await DeliveryService.calculateDeliveryFee(
          selectedAddress.latitude,
          selectedAddress.longitude,
          subtotal,
          nearestStore.id
        );

        console.log('Delivery fee calculation response:', response);

        if (response.success) {
          const data = response.data;
          console.log('Setting delivery fee:', {
            fee: data.fee,
            info: data
          });
          setDeliveryFee(data.fee);
          setDeliveryInfo(data);
          onDeliveryFeeCalculated(data.fee, data);
        } else {
          throw new Error(response.message || 'Failed to calculate delivery fee');
        }
      } catch (error) {
        console.error('Error calculating delivery fee:', error);
        setError('Failed to calculate delivery fee');
        onDeliveryFeeCalculated(0, null);
      } finally {
        setLoading(false);
      }
    };

    calculateDeliveryFee();
  }, [selectedMethod, selectedAddress, isDeliveryAvailable, nearestStore, subtotal, onDeliveryFeeCalculated]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium text-gray-900">Delivery Method</h3>
      
      {selectedAddress && !isDeliveryAvailable && !isPickupAvailable && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">
            Sorry, this address is outside our delivery and pickup zones. Please try a different address.
          </p>
        </div>
      )}

      {selectedAddress && (isDeliveryAvailable || isPickupAvailable) && (
        <div className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="delivery"
                name="deliveryMethod"
                value="delivery"
                checked={selectedMethod === 'delivery'}
                onChange={() => onMethodChange('delivery')}
                disabled={!isDeliveryAvailable}
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label htmlFor="delivery" className={`ml-3 block text-sm font-medium ${!isDeliveryAvailable ? 'text-gray-400' : 'text-gray-700'}`}>
                Delivery
                {deliveryFee > 0 && isDeliveryAvailable && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({formatNaira(deliveryFee)})
                  </span>
                )}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="radio"
                id="pickup"
                name="deliveryMethod"
                value="pickup"
                checked={selectedMethod === 'pickup'}
                onChange={() => onMethodChange('pickup')}
                disabled={!isPickupAvailable}
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label htmlFor="pickup" className={`ml-3 block text-sm font-medium ${!isPickupAvailable ? 'text-gray-400' : 'text-gray-700'}`}>
                Pickup (Free)
              </label>
            </div>
          </div>

          {selectedMethod === 'delivery' && (
            <div className="mt-4 pl-4">
              {loading && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  <span className="text-sm">Calculating delivery fee...</span>
                </div>
              )}
              
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              
              {deliveryInfo && isDeliveryAvailable && (
                <div className="text-sm">
                  <p className="text-green-600">{deliveryInfo.message}</p>
                  {deliveryInfo.estimatedTime > 0 && (
                    <p className="text-green-600">
                      Estimated delivery time: Under {deliveryInfo.estimatedTime} minutes
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedMethod === 'pickup' && nearestStore && (
            <div className="mt-4 pl-4">
              <div className="text-sm text-gray-700">
                <p className="font-medium">{nearestStore.name}</p>
                <p>{nearestStore.formatted_address}</p>
                {nearestStore.phone && <p>Phone: {nearestStore.phone}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedAddress && (
        <p className="mt-4 text-sm text-gray-500">
          Please select a delivery address to see available options.
        </p>
      )}
    </div>
  );
};

export default DeliveryMethodSelector;
