import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { formatNaira } from '../utils/formatters';
import AddressSelector from '../components/address/AddressSelector';
import DeliveryMethodSelector from '../components/delivery/DeliveryMethodSelector';
import AddressService from '../services/address.service';
import CartService from '../services/cart.service';
import CouponService from '../services/coupon.service';
import StoreService from '../services/store.service';
import axios from 'axios';

const Cart = () => {
  const { cartItems, loading, error, updateCartItem, removeCartItem, clearCart, setCartItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // State for coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const saved = localStorage.getItem('appliedCoupon');
    return saved ? JSON.parse(saved) : null;
  });
  const [discountAmount, setDiscountAmount] = useState(() => {
    const saved = localStorage.getItem('discountAmount');
    return saved ? parseFloat(saved) : 0;
  });

  // State for delivery
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [taxRate, setTaxRate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [nearestStore, setNearestStore] = useState(null);
  const [isWithinDeliveryRadius, setIsWithinDeliveryRadius] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryError, setDeliveryError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user) return;
      
      setIsLoading(true);
      try {
        // Fetch tax rate from settings
        const settingsResponse = await axios.get('http://localhost:8000/api/settings', {
          params: { keys: ['tax_rate'] }
        });
        
        console.log('Tax settings API response:', settingsResponse.data);
        
        if (settingsResponse.data && settingsResponse.data.success) {
          const taxRateSetting = settingsResponse.data.data.find(s => s.key === 'tax_rate');
          console.log('Tax rate setting found:', taxRateSetting);
          
          if (taxRateSetting) {
            const parsedTaxRate = parseFloat(taxRateSetting.value) || 0;
            console.log('Parsed tax rate:', parsedTaxRate);
            setTaxRate(parsedTaxRate);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const checkDeliveryAvailability = async () => {
      console.log('Selected Address:', selectedAddress);
      if (!selectedAddress?.latitude || !selectedAddress?.longitude) {
        console.log('Missing required data:', {
          hasLatitude: !!selectedAddress?.latitude,
          hasLongitude: !!selectedAddress?.longitude
        });
        // Clear any previous error when address is not yet complete
        setDeliveryError('');
        return;
      }

      try {
        setDeliveryError(''); // Clear any previous error
        console.log('Finding nearest store for:', {
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude
        });

        const { store, isDeliveryAvailable, isPickupAvailable } = await StoreService.findNearestStore({
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude
        });

        console.log('Nearest store response:', {
          store,
          isDeliveryAvailable,
          isPickupAvailable
        });

        setNearestStore(store);
        if (store && !isDeliveryAvailable && !isPickupAvailable) {
          console.log('Delivery not available:', {
            store,
            isDeliveryAvailable,
            isPickupAvailable
          });
          setDeliveryError('This address is outside our delivery and pickup zones. Please try a different address.');
          setDeliveryMethod(null);
        } else {
          setDeliveryError('');
        }
      } catch (err) {
        console.error('Error checking delivery availability:', err);
        setDeliveryError('Error checking delivery availability. Please try again.');
      }
    };

    if (selectedAddress) {
      checkDeliveryAvailability();
    } else {
      // Clear error when no address is selected
      setDeliveryError('');
    }
  }, [selectedAddress]);

  // Effect to persist coupon data
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
      localStorage.setItem('discountAmount', discountAmount.toString());
    } else {
      localStorage.removeItem('appliedCoupon');
      localStorage.removeItem('discountAmount');
    }
  }, [appliedCoupon, discountAmount]);

  // Clear delivery method and address on unmount/refresh
  useEffect(() => {
    localStorage.removeItem('deliveryMethod');
    localStorage.removeItem('selectedAddressId');
    localStorage.removeItem('selectedAddress');
    localStorage.removeItem('shippingFee');
    localStorage.removeItem('deliveryInfo');
  }, []);

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const product = item.product || {};
      const itemPrice = parseFloat(product.sale_price) || parseFloat(product.base_price) || 0;
      return total + (itemPrice * item.quantity);
    }, 0);
  }, [cartItems]);

  // Calculate tax amount
  const taxAmount = useMemo(() => {
    const calculatedTax = subtotal * (taxRate / 100);
    console.log('Tax calculation:', { subtotal, taxRate, calculatedTax });
    return calculatedTax;
  }, [subtotal, taxRate]);

  // Calculate total
  const total = useMemo(() => {
    return subtotal + taxAmount + shippingFee - discountAmount;
  }, [subtotal, taxAmount, shippingFee, discountAmount]);

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const item = cartItems.find(item => item.id === itemId);
    if (item && newQuantity <= (item.product ? item.product.stock_quantity : item.stock_quantity || 10)) {
      updateCartItem(itemId, newQuantity);
    }
  };

  // Handle remove item
  const handleRemoveItem = (itemId) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      removeCartItem(itemId);
    }
  };

  // Clear persisted data when cart is cleared
  const handleClearCart = () => {
    clearCart();
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setShippingFee(0);
    setDeliveryInfo(null);
    localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('discountAmount');
    localStorage.removeItem('shippingFee');
    localStorage.removeItem('deliveryInfo');
  };

  // Handle apply coupon
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');
    
    try {
      const response = await CouponService.validateCoupon(
        couponCode.trim(),
        subtotal,
        cartItems
      );
      
      if (response.valid) {
        setAppliedCoupon(response.coupon);
        setDiscountAmount(response.discount_amount);
        setCouponSuccess('Coupon applied successfully!');
        setCouponCode('');
      } else {
        setCouponError(response.message || 'Invalid coupon code');
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError(error.message || 'Failed to apply coupon');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
    localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('discountAmount');
  };

  // Handle address selection
  const handleAddressSelect = useCallback((address) => {
    console.log('Address selected:', address);
    if (address && address.id) {
      setSelectedAddressId(address.id);
      setSelectedAddress(address);
    }
  }, []);

  // Handle delivery method change
  const handleDeliveryMethodChange = useCallback((method) => {
    console.log('Delivery method changed:', {
      from: deliveryMethod,
      to: method,
      address: selectedAddress,
      nearestStore
    });

    setDeliveryMethod(method);
    
    // Reset address if switching to pickup
    if (method === 'pickup') {
      setSelectedAddressId('');
      setSelectedAddress(null);
      setShippingFee(0);
      setDeliveryInfo(null);
    }
  }, [deliveryMethod, selectedAddress, nearestStore]);

  // Memoize the delivery fee callback
  const handleDeliveryFeeCalculated = useCallback((fee, info) => {
    setShippingFee(fee);
    setDeliveryInfo(info);
  }, []);

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    // If user is authenticated and delivery is selected, make sure they have selected an address
    if (isAuthenticated && deliveryMethod === 'delivery' && !selectedAddressId) {
      // Show error message
      setCheckoutError('Please select a delivery address before proceeding to checkout');
      // Scroll to address selector
      window.scrollTo({
        top: document.querySelector('.AddressSelector')?.offsetTop - 100 || 0,
        behavior: 'smooth'
      });
      return;
    }
    
    // Clear any previous checkout errors
    setCheckoutError('');
    
    // Save all order details to localStorage
    const orderDetails = {
      selectedAddressId,
      deliveryMethod,
      selectedAddress,
      shippingFee,
      deliveryInfo,
      subtotal,
      discountAmount,
      appliedCoupon,
      taxAmount,
      taxRate,
      total,
      cartItems: cartItems.map(item => ({
        ...item,
        product: {
          id: item.product.id,
          name: item.product.name,
          base_price: item.product.base_price,
          sale_price: item.product.sale_price
        }
      }))
    };
    
    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-lg text-gray-600">Updating cart...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error: {error.message || 'An error occurred while loading your cart.'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-lg text-gray-600 mb-4">Your cart is empty</p>
            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items Section */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4"
                  >
                    <div className="flex-shrink-0 w-24 h-24">
                      <img
                        src={item.product ? (item.product.image_url || item.product.image || '/placeholder.jpg') : '/placeholder.jpg'}
                        alt={item.product ? item.product.name : `Product #${item.product_id}`}
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{item.product ? item.product.name : `Product #${item.product_id}`}</h3>
                      <p className="text-sm text-gray-500">{item.product ? item.product.description : ''}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                            className="px-3 py-1 text-gray-600 hover:text-gray-800"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-x">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:text-gray-800"
                            disabled={item.quantity >= (item.product ? item.product.stock_quantity : item.stock_quantity || 10)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        {formatNaira((item.product ? 
                          (parseFloat(item.product.sale_price) || parseFloat(item.product.base_price)) : 0) * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatNaira(item.product ? (parseFloat(item.product.sale_price) || parseFloat(item.product.base_price)) : 0)} each
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Cart Action Buttons */}
                <div className="mt-6 flex space-x-4">
                  <Link
                    to="/shop"
                    className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Continue Shopping
                  </Link>
                  <button
                    onClick={() => clearCart()}
                    className="px-6 py-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Order Summary Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 sticky top-4">
                  <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                  
                  {/* Coupon Section */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 min-w-0 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                      >
                        {couponLoading ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-sm text-red-600">{couponError}</p>
                    )}
                    {couponSuccess && (
                      <p className="text-sm text-green-600">{couponSuccess}</p>
                    )}
                    {appliedCoupon && (
                      <div className="flex items-center justify-between bg-green-50 p-2 rounded-md">
                        <span className="text-sm text-green-700">
                          Coupon applied: {appliedCoupon.code}
                        </span>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Address Selector */}
                  {isAuthenticated && (
                    <AddressSelector
                      selectedAddressId={selectedAddressId}
                      onAddressSelect={handleAddressSelect}
                    />
                  )}

                  {/* Delivery Method Selector */}
                  {isAuthenticated && selectedAddress && (
                    <DeliveryMethodSelector
                      selectedMethod={deliveryMethod}
                      onMethodChange={handleDeliveryMethodChange}
                      selectedAddress={selectedAddress}
                      subtotal={subtotal}
                      onDeliveryFeeCalculated={handleDeliveryFeeCalculated}
                    />
                  )}

                  {/* Price Breakdown */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatNaira(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatNaira(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery Fee</span>
                      <span>{formatNaira(shippingFee)}</span>
                    </div>
                    {taxAmount > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax ({taxRate.toFixed(1)}%)</span>
                        <span>{formatNaira(taxAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span>{formatNaira(total)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={!selectedAddressId || !deliveryMethod}
                    className="w-full py-3 px-4 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed to Checkout
                  </button>
                  {deliveryError && (
                    <p className="text-sm text-red-600">{deliveryError}</p>
                  )}
                  {checkoutError && (
                    <p className="text-sm text-red-600">{checkoutError}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
