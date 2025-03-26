import React, { useState, useEffect, useMemo } from 'react';
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
import axios from 'axios';

const Cart = () => {
  const { cartItems, loading, error, updateCartItem, removeCartItem, clearCart, setCartItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [shippingFee, setShippingFee] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [taxRate, setTaxRate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Only fetch addresses if user is authenticated
        if (isAuthenticated && user?.id) {
          try {
            const { addresses: userAddresses } = await AddressService.getUserAddresses(user.id);
            setAddresses(userAddresses);
            
            // Set default address if available
            const defaultAddress = userAddresses.find(addr => addr.is_default);
            if (defaultAddress) {
              setSelectedAddress(defaultAddress);
              setSelectedAddressId(defaultAddress.id);
            }
          } catch (error) {
            console.error('Error fetching addresses:', error);
          }
        }
        
        // Fetch tax rate from settings
        try {
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
          console.error('Error fetching tax rate:', error);
          // Default to 0% tax if settings can't be fetched
          setTaxRate(0);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, user]);

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

  // Calculate discount amount
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    
    if (appliedCoupon.type === 'percentage') {
      const amount = (subtotal * appliedCoupon.value) / 100;
      return appliedCoupon.max_discount_amount 
        ? Math.min(amount, appliedCoupon.max_discount_amount)
        : amount;
    }
    
    return appliedCoupon.value;
  }, [subtotal, appliedCoupon]);

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

  // Handle clear cart
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
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
        setCouponSuccess('Coupon applied successfully!');
        setCouponCode('');
      } else {
        setCouponError(response.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError(error.message || 'Failed to apply coupon');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
    setCouponCode('');
  };

  // Handle address selection
  const handleAddressSelect = async (addressId) => {
    setSelectedAddressId(addressId);
    
    if (addressId) {
      try {
        // Fetch the full address details to get latitude and longitude
        const response = await AddressService.getAddress(addressId);
        if (response && response.success && response.address) {
          setSelectedAddress(response.address);
        } else {
          console.error('Failed to get address details:', response?.message);
          setSelectedAddress(null);
        }
      } catch (error) {
        console.error('Error fetching address details:', error);
        setSelectedAddress(null);
      }
    } else {
      setSelectedAddress(null);
    }
  };

  // Handle delivery method change
  const handleDeliveryMethodChange = (method) => {
    setDeliveryMethod(method);
  };

  // Handle delivery fee calculation
  const handleDeliveryFeeCalculated = (fee, info) => {
    setShippingFee(fee);
    setDeliveryInfo(info);
  };

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
    
    // Store selected address ID in localStorage for use in checkout
    if (isAuthenticated && selectedAddressId) {
      localStorage.setItem('selectedAddressId', selectedAddressId);
      localStorage.setItem('deliveryMethod', deliveryMethod);
      
      if (deliveryMethod === 'pickup' && deliveryInfo && deliveryInfo.store_id) {
        localStorage.setItem('pickupStoreId', deliveryInfo.store_id);
      }
    }
    
    navigate('/checkout');
  };

  // Empty cart view
  if (!isLoading && cartItems.length === 0) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
          
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link 
              to="/products"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-md transition duration-300"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {/* Cart header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Shopping Cart ({cartItems.length} items)</h2>
              </div>
              
              {/* Loading state */}
              {isLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-6">
                    {[1, 2].map((item) => (
                      <div key={item} className="flex flex-col sm:flex-row gap-4">
                        <div className="bg-gray-300 rounded-lg h-24 w-24"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
                          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Cart items */}
                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-6 flex flex-col sm:flex-row">
                        {/* Product image */}
                        <div className="sm:w-24 sm:h-24 flex-shrink-0 mb-4 sm:mb-0">
                          <Link to={`/products/${item.product ? item.product.slug : `product-${item.product_id}`}`}>
                            <img 
                              src={item.product ? (item.product.image_url || item.product.image || '/placeholder.jpg') : '/placeholder.jpg'} 
                              alt={item.product ? item.product.name : `Product #${item.product_id}`} 
                              className="w-full h-full object-cover rounded-md"
                              onError={(e) => {
                                e.target.src = '/placeholder.jpg';
                              }}
                            />
                          </Link>
                        </div>
                        
                        {/* Product details */}
                        <div className="sm:ml-6 flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <Link 
                                to={`/products/${item.product ? item.product.slug : `product-${item.product_id}`}`}
                                className="text-lg font-medium text-gray-900 hover:text-primary"
                              >
                                {item.product ? item.product.name : `Product #${item.product_id}`}
                              </Link>
                              
                              {/* Product attributes if any */}
                              {item.attributes && Object.keys(item.attributes).length > 0 && (
                                <div className="mt-1 text-sm text-gray-500">
                                  {Object.entries(item.attributes).map(([key, value]) => (
                                    <span key={key} className="mr-4">
                                      {key}: {value}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {/* Price */}
                              <div className="mt-1">
                                {item.product && item.product.sale_price ? (
                                  <div className="flex items-center">
                                    <span className="text-lg font-bold text-primary">
                                      {formatNaira(item.product.sale_price)}
                                    </span>
                                    <span className="ml-2 text-sm text-gray-500 line-through">
                                      {formatNaira(item.product.base_price)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-lg font-bold text-primary">
                                    {formatNaira(item.product ? item.product.base_price : 0)}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Quantity and remove */}
                            <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                              {/* Quantity controls */}
                              <div className="flex items-center mt-4">
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
                                  disabled={item.quantity <= 1}
                                >
                                  <span className="sr-only">Decrease quantity</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <input
                                  type="text"
                                  value={item.quantity}
                                  readOnly
                                  className="w-12 h-8 border-t border-b border-gray-300 text-center text-sm"
                                />
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                                  disabled={item.quantity >= (item.product ? item.product.stock_quantity : item.stock_quantity || 10)}
                                >
                                  <span className="sr-only">Increase quantity</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                              
                              {/* Item total */}
                              <div className="mt-2 text-right">
                                <span className="text-sm text-gray-500">
                                  Subtotal: <span className="font-medium text-gray-900">
                                    {formatNaira((item.product ? 
                                      (parseFloat(item.product.sale_price) || parseFloat(item.product.base_price)) : 0) * item.quantity)}
                                  </span>
                                </span>
                              </div>
                              
                              {/* Remove button */}
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Cart actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Clear Cart
                    </button>
                    <Link
                      to="/products"
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Order summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>
              
              <div className="p-6">
                {/* Coupon form */}
                <form onSubmit={handleApplyCoupon} className="mb-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 p-2 border rounded"
                      disabled={couponLoading || !!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <Button
                        type="button"
                        onClick={handleRemoveCoupon}
                        variant="danger"
                        className="whitespace-nowrap"
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={couponLoading || !couponCode.trim()}
                        className="whitespace-nowrap"
                      >
                        {couponLoading ? 'Applying...' : 'Apply'}
                      </Button>
                    )}
                  </div>
                  
                  {/* Coupon error */}
                  {couponError && (
                    <p className="mt-2 text-red-600 text-sm">{couponError}</p>
                  )}
                  
                  {/* Coupon success */}
                  {couponSuccess && (
                    <p className="mt-2 text-green-600 text-sm">{couponSuccess}</p>
                  )}
                  
                  {/* Applied coupon info */}
                  {appliedCoupon && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Applied: {appliedCoupon.code}</p>
                      <p>{appliedCoupon.description}</p>
                    </div>
                  )}
                </form>
                
                {/* Address Selector for authenticated users */}
                {isAuthenticated && (
                  <div className="mb-6">
                    <div className="AddressSelector">
                      <AddressSelector 
                        onAddressSelect={handleAddressSelect} 
                        selectedAddressId={selectedAddressId} 
                      />
                    </div>
                  </div>
                )}
                
                {/* Delivery Method Selector */}
                {isAuthenticated && (
                  <DeliveryMethodSelector
                    selectedAddress={selectedAddress}
                    setSelectedAddress={setSelectedAddress}
                    subtotal={subtotal}
                    onDeliveryFeeCalculated={handleDeliveryFeeCalculated}
                    selectedMethod={deliveryMethod}
                    onMethodChange={handleDeliveryMethodChange}
                  />
                )}
                
                {/* Summary details */}
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatNaira(subtotal)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatNaira(discountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      VAT Tax{taxAmount > 0 ? ` (${taxRate}%)` : ''}
                    </span>
                    <span className="font-medium">{formatNaira(taxAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>
                      {deliveryMethod === 'pickup' 
                        ? 'Free (Pickup)' 
                        : shippingFee === 0 
                          ? 'Free'
                          : formatNaira(shippingFee)
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between font-semibold text-lg pt-4 border-t">
                    <span>Total</span>
                    <span>{formatNaira(total)}</span>
                  </div>
                </div>
                
                {/* Checkout error message */}
                {checkoutError && (
                  <div className="mb-4">
                    <p className="text-red-500 text-sm">{checkoutError}</p>
                  </div>
                )}
                
                {/* Checkout button */}
                <Button 
                  variant="primary"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </Button>
                
                {/* Payment methods */}
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2">We accept:</p>
                  <div className="flex space-x-2">
                    <div className="bg-gray-100 rounded p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-10" viewBox="0 0 40 24">
                        <rect width="40" height="24" rx="4" fill="#016FD0"/>
                        <path d="M18.5 15.5H21.5V8.5H18.5V15.5Z" fill="white"/>
                        <path d="M18.9 12C18.9 10.3 20.2 9 21.9 9C22.4 9 22.9 9.1 23.3 9.3V8.5C22.9 8.3 22.4 8.2 21.9 8.2C19.8 8.2 18 10 18 12C18 14 19.8 15.8 21.9 15.8C22.4 15.8 22.9 15.7 23.3 15.5V14.7C22.9 14.9 22.4 15 21.9 15C20.2 15 18.9 13.7 18.9 12Z" fill="white"/>
                        <path d="M24.5 11.2L24 10.3H23.2V15.5H24V11.8L24.5 12.7H25.5L26 11.8V15.5H26.8V10.3H26L25.2 11.2H24.5Z" fill="white"/>
                        <path d="M14.2 15.5H15V10.3H13.8C12.7 10.3 12 11 12 11.8C12 12.5 12.4 12.9 13.1 13.3L12 15.5H12.8L13.8 13.4L14.2 13.2V15.5ZM14.2 12.6L13.8 12.4C13.3 12.2 12.8 12 12.8 11.6C12.8 11.2 13.2 11 13.8 11H14.2V12.6Z" fill="white"/>
                        <path d="M16 15.5H16.8V13.8H18.3V13.1H16.8V11H18.3V10.3H16V15.5Z" fill="white"/>
                      </svg>
                    </div>
                    <div className="bg-gray-100 rounded p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-10" viewBox="0 0 40 24">
                        <rect width="40" height="24" rx="4" fill="#EB001B" fillOpacity="0.15"/>
                        <path d="M15.4 15.8C17.9 15.8 19.9 13.8 19.9 11.3C19.9 8.8 17.9 6.8 15.4 6.8C12.9 6.8 10.9 8.8 10.9 11.3C10.9 13.8 12.9 15.8 15.4 15.8Z" fill="#EB001B"/>
                        <path d="M24.6 15.8C27.1 15.8 29.1 13.8 29.1 11.3C29.1 8.8 27.1 6.8 24.6 6.8C22.1 6.8 20.1 8.8 20.1 11.3C20.1 13.8 22.1 15.8 24.6 15.8Z" fill="#F79E1B"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M20 11.3C20 9.9 20.5 8.6 21.4 7.6C20.4 6.7 19.1 6.2 17.7 6.2C14.5 6.2 11.9 8.5 11.9 11.3C11.9 14.1 14.5 16.4 17.7 16.4C19.1 16.4 20.4 15.9 21.4 15C20.5 14 20 12.7 20 11.3Z" fill="#FF5F00"/>
                      </svg>
                    </div>
                    <div className="bg-gray-100 rounded p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-10" viewBox="0 0 40 24">
                        <rect width="40" height="24" rx="4" fill="#1A1F71"/>
                        <path d="M15.6 14.8L16.2 12.1L15.3 14.8H14.4L14.2 11.9L13.6 14.8H12.9L13.7 10.8H14.8L15 13.2L15.8 10.8H17L16.1 14.8H15.6Z" fill="white"/>
                        <path d="M17.5 14.8L16.8 10.8H17.6L18.3 14.8H17.5Z" fill="white"/>
                        <path d="M20.3 11.5L20.5 10.8H19.3L18.5 14.8H19.3L19.6 13.3H20.3C20.9 13.3 21.3 13 21.3 12.4C21.3 11.8 20.9 11.5 20.3 11.5ZM20.1 12.7H19.7L19.8 12H20.2C20.5 12 20.6 12.1 20.6 12.3C20.6 12.6 20.4 12.7 20.1 12.7Z" fill="white"/>
                        <path d="M23.1 14.8L22.9 14.2C22.8 14.3 22.5 14.4 22.3 14.4C21.9 14.4 21.6 14.1 21.6 13.7C21.6 13.1 22 12.7 22.5 12.7C22.7 12.7 22.9 12.8 23 12.9L23.1 12.3C23 12.2 22.7 12.1 22.4 12.1C21.6 12.1 20.9 12.8 20.9 13.7C20.9 14.4 21.3 14.9 22.1 14.9C22.4 14.9 22.7 14.8 23 14.7L23.1 14.8Z" fill="white"/>
                        <path d="M25.2 14.8L25 14C24.9 14.1 24.6 14.2 24.4 14.2C24 14.2 23.7 13.9 23.7 13.5C23.7 12.9 24.1 12.5 24.6 12.5C24.8 12.5 25 12.6 25.1 12.7L25.2 12.1C25.1 12 24.8 11.9 24.5 11.9C23.7 11.9 23 12.6 23 13.5C23 14.2 23.4 14.7 24.2 14.7C24.5 14.7 24.8 14.6 25.1 14.5L25.2 14.8Z" fill="white"/>
                        <path d="M26.6 12.6C26.8 12.6 27 12.7 27.1 12.8L27.3 12.2C27.2 12.1 26.9 12 26.6 12C25.8 12 25.2 12.7 25.2 13.7C25.2 14.4 25.6 14.9 26.3 14.9C26.6 14.9 26.9 14.8 27.2 14.7L27.1 14.1C27 14.2 26.8 14.3 26.6 14.3C26.2 14.3 25.9 14 25.9 13.6C25.9 13 26.2 12.6 26.6 12.6Z" fill="white"/>
                      </svg>
                    </div>
                    <div className="bg-gray-100 rounded p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-10" viewBox="0 0 40 24">
                        <rect width="40" height="24" rx="4" fill="#2790C3"/>
                        <path d="M16.3 10.9H15V14.7H16.3C17.4 14.7 18.1 13.9 18.1 12.8C18.1 11.7 17.4 10.9 16.3 10.9ZM16.2 14H15.8V11.6H16.2C17 11.6 17.4 12.1 17.4 12.8C17.4 13.5 17 14 16.2 14Z" fill="white"/>
                        <path d="M19.4 14.7H20.1V13.1H21.5V12.5H20.1V11.6H21.6V10.9H19.4V14.7Z" fill="white"/>
                        <path d="M24.2 12.8C24.2 11.7 23.5 10.9 22.4 10.9H21.1V14.7H21.9V13.3H22L23.1 14.7H24L22.8 13.2C23.6 13.1 24.2 12.5 24.2 12.8ZM22.3 12.7H21.9V11.6H22.3C22.9 11.6 23.3 12 23.3 12.1C23.3 12.3 22.9 12.7 22.3 12.7Z" fill="white"/>
                        <path d="M24.5 10.9V14.7H27.1V14H25.2V13H27V12.4H25.2V11.6H27.1V10.9H24.5Z" fill="white"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Secure checkout message */}
                <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure Checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
