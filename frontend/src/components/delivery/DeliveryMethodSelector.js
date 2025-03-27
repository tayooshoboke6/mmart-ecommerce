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
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [nearestStore, setNearestStore] = useState(null);
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(false);
  const [isPickupAvailable, setIsPickupAvailable] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);

  // Check delivery availability when address changes
  useEffect(() => {
    const checkDeliveryAvailability = async () => {
      if (!selectedAddress) {
        console.log('No address selected, resetting delivery options');
        setIsDeliveryAvailable(false);
        setIsPickupAvailable(false);
        setNearestStore(null);
        setValidationComplete(false);
        return;
      }

      // Set validating state to true before starting validation
      setValidating(true);
      setValidationComplete(false);
      setError('');

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
        setValidationComplete(true);
      } catch (error) {
        console.error('Error checking delivery availability:', error);
        setError('Failed to check delivery availability');
        setIsDeliveryAvailable(false);
        setIsPickupAvailable(false);
        setNearestStore(null);
        setValidationComplete(true);
      } finally {
        setValidating(false);
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
      
      {/* Show loading state while validating */}
      {selectedAddress && validating && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <div className="mr-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-blue-700">
              Checking delivery options for your address...
            </p>
          </div>
        </div>
      )}
      
      {/* Only show error message after validation is complete */}
      {selectedAddress && validationComplete && !validating && !isDeliveryAvailable && !isPickupAvailable && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">
            Sorry, this address is outside our delivery and pickup zones. Please try a different address.
          </p>
        </div>
      )}

      {/* Only show delivery methods after validation is complete */}
      {selectedAddress && validationComplete && !validating && (isDeliveryAvailable || isPickupAvailable) && (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {isPickupAvailable && (
              <label 
                htmlFor="pickup" 
                className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all h-32 ${
                  selectedMethod === 'pickup' 
                    ? 'border-primary bg-primary-50 shadow-sm' 
                    : 'border-gray-300 hover:border-primary-light'
                }`}
              >
                <div className="flex items-center justify-center w-full h-full">
                  <input
                    type="radio"
                    id="pickup"
                    name="deliveryMethod"
                    value="pickup"
                    checked={selectedMethod === 'pickup'}
                    onChange={() => onMethodChange('pickup')}
                    className="sr-only" // Hide the actual radio button
                  />
                  <div className="text-center">
                    <div className="font-medium text-lg">Pickup</div>
                    <div className="text-sm text-gray-500">Today</div>
                    <div className="mt-1 text-sm text-primary">Free</div>
                  </div>
                </div>
              </label>
            )}
            
            {isDeliveryAvailable && (
              <label 
                htmlFor="delivery" 
                className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all h-32 ${
                  selectedMethod === 'delivery' 
                    ? 'border-primary bg-primary-50 shadow-sm' 
                    : 'border-gray-300 hover:border-primary-light'
                }`}
              >
                <div className="flex items-center justify-center w-full h-full">
                  <input
                    type="radio"
                    id="delivery"
                    name="deliveryMethod"
                    value="delivery"
                    checked={selectedMethod === 'delivery'}
                    onChange={() => onMethodChange('delivery')}
                    className="sr-only" // Hide the actual radio button
                  />
                  <div className="text-center">
                    <div className="font-medium text-lg">Delivery</div>
                    <div className="text-sm text-gray-500">Today</div>
                    {deliveryInfo && (
                      <div className="mt-1 text-sm text-primary">
                        {formatNaira(deliveryFee)}
                      </div>
                    )}
                  </div>
                </div>
              </label>
            )}
          </div>
          
          {selectedMethod === 'delivery' && deliveryInfo && (
            <div className="mt-2 text-sm text-green-600 text-center">
              Estimated delivery time: {deliveryInfo.estimated_time || deliveryInfo.estimatedTime} minutes
            </div>
          )}
          
          {loading && (
            <div className="mt-2">
              <div className="animate-pulse h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          )}
          
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      )}
      
      {!selectedAddress && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-gray-700">
            Please select a delivery address to see available delivery methods.
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryMethodSelector;
