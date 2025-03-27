import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/format';
import { 
  initializePaystackPayment, 
  initializeFlutterwavePayment, 
  generatePaymentReference, 
  nairaToKobo 
} from '../utils/payment';
import api from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  
  // State for order details from cart
  const [orderDetails, setOrderDetails] = useState(null);
  
  // Debug authentication status
  useEffect(() => {
    console.log('Authentication status:', { 
      isLoggedIn: !!user, 
      userId: user?.id,
      userName: user?.name
    });
  }, [user]);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    paymentMethod: 'card',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Get saved order details
    const savedDetails = localStorage.getItem('orderDetails');
    if (savedDetails) {
      const details = JSON.parse(savedDetails);
      setOrderDetails(details);
      
      // Pre-fill address fields if delivery address exists
      if (details.selectedAddress) {
        const address = details.selectedAddress;
        setFormData(prev => ({
          ...prev,
          address: address.street || address.address || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.postalCode || address.zip_code || '',
          // Use name and phone from the address if available
          firstName: address.name?.split(' ')[0] || prev.firstName || '',
          lastName: address.name?.split(' ').slice(1).join(' ') || prev.lastName || '',
          phone: address.phone || prev.phone || '',
        }));
      }
    } else {
      // Redirect back to cart if no details found
      navigate('/cart');
    }
    
    // Ensure cart is synced with backend
    const syncCartWithBackend = async () => {
      if (user && cartItems && cartItems.length > 0) {
        try {
          console.log('Syncing cart with backend before checkout');
          // Use the newly implemented cart sync endpoint
          const response = await api.post('/cart/sync', { 
            items: cartItems.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              measurement_id: item.measurement?.id
            }))
          });
          console.log('Cart synced successfully', response.data);
        } catch (error) {
          console.error('Failed to sync cart with backend:', error);
          // Continue with checkout even if sync fails
        }
      }
    };
    
    syncCartWithBackend();
  }, [navigate, user, cartItems]);
  
  // Redirect to cart if no items
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!orderDetails) {
      setError('Order details not found. Please return to cart.');
      setLoading(false);
      return;
    }
    
    try {
      // Create the order data using saved details
      const orderData = {
        payment_method: formData.paymentMethod === 'paystack' || formData.paymentMethod === 'flutterwave' ? 'card' : 
                       formData.paymentMethod === 'cashOnDelivery' ? 'cash_on_delivery' : formData.paymentMethod,
        delivery_method: orderDetails.deliveryMethod,
        shipping_address: orderDetails.selectedAddress?.address,
        shipping_city: orderDetails.selectedAddress?.city,
        shipping_state: orderDetails.selectedAddress?.state,
        shipping_zip: orderDetails.selectedAddress?.zip_code,
        shipping_phone: formData.phone,
        shipping_fee: orderDetails.shippingFee || 0,
        notes: '',
        coupon_code: orderDetails.appliedCoupon?.code,
        subtotal: orderDetails.subtotal,
        discount: orderDetails.discountAmount,
        tax: orderDetails.taxAmount,
        grand_total: orderDetails.total,
        items: orderDetails.cartItems
      };

      console.log('Order data being sent to API:', orderData);
      
      // Handle different payment methods
      if (formData.paymentMethod === 'paystack') {
        try {
          // Generate payment reference first
          const reference = generatePaymentReference();
          
          // First create the order in the database with pending status
          const orderWithItems = {
            payment_method: 'card', // Required field
            payment_gateway: 'paystack',
            payment_status: 'pending',
            payment_reference: reference, // Include payment reference when creating the order
            delivery_method: orderDetails.deliveryMethod === 'delivery' ? 'shipping' : 'pickup', // Must be 'shipping' or 'pickup'
            shipping_address: orderDetails.selectedAddress?.address || formData.address || 'No address provided',
            shipping_city: orderDetails.selectedAddress?.city || formData.city || 'No city provided',
            shipping_state: orderDetails.selectedAddress?.state || formData.state || 'No state provided',
            shipping_zip: orderDetails.selectedAddress?.zip_code || formData.zipCode || '00000',
            shipping_phone: formData.phone || '0000000000',
            shipping_fee: orderDetails.shippingFee || 0,
            customer_email: formData.email,
            notes: '',
            coupon_code: orderDetails.appliedCoupon?.code || '',
            subtotal: orderDetails.subtotal || 0,
            discount: orderDetails.discountAmount || 0,
            tax: orderDetails.taxAmount || 0,
            grand_total: orderDetails.total || 0,
            items: orderDetails.cartItems.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: parseFloat(item.product.sale_price) || parseFloat(item.product.base_price) || 0,
              product_name: item.product.name || 'Unknown Product',
              measurement_unit: item.measurement?.unit || 'unit',
              measurement_value: item.measurement?.value || '0',
              product_measurement_id: item.measurement?.id || null
            }))
          };
          
          console.log('Creating order in database before Paystack payment:', orderWithItems);
          
          // Create the order first
          const orderResponse = await api.post('/orders', orderWithItems);
          console.log('Order created successfully:', orderResponse.data);
          
          // Get the order ID from the response
          const orderId = orderResponse.data.order.id;
          
          // Initialize Paystack payment with correct amount and order ID
          const paymentData = {
            email: formData.email,
            amount: nairaToKobo(orderDetails.total),
            reference: reference, // Use the same reference we included in the order
            callback_url: `${window.location.origin}/payment/callback`,
            metadata: {
              order_id: orderId,
              customer_name: `${formData.firstName} ${formData.lastName}`,
              customer_email: formData.email
            }
          };
          
          const paymentResponse = await initializePaystackPayment(paymentData);
          console.log('Paystack payment initialized:', paymentResponse);
          
          if (paymentResponse && paymentResponse.data && paymentResponse.data.authorization_url) {
            const reference = paymentResponse.data.reference;
            
            // Store order data in localStorage for retrieval after payment
            localStorage.setItem('pendingOrder', JSON.stringify({
              orderId,
              reference
            }));
            
            // Redirect to Paystack payment page
            window.location.href = paymentResponse.data.authorization_url;
            return;
          } else {
            throw new Error('Invalid payment response');
          }
        } catch (error) {
          console.error('Paystack payment error:', error);
          setError('Payment initialization failed: ' + (error.message || 'Unknown error'));
          setLoading(false);
          return;
        }
      } else if (formData.paymentMethod === 'flutterwave') {
        try {
          // Generate payment reference first
          const reference = generatePaymentReference();
          
          // First create the order in the database with pending status
          const orderWithItems = {
            payment_method: 'card',
            payment_gateway: 'flutterwave',
            payment_status: 'pending',
            payment_reference: reference, // Include payment reference when creating the order
            delivery_method: orderDetails.deliveryMethod === 'delivery' ? 'shipping' : 'pickup', // Must be 'shipping' or 'pickup'
            shipping_address: orderDetails.selectedAddress?.address || formData.address || 'No address provided',
            shipping_city: orderDetails.selectedAddress?.city || formData.city || 'No city provided',
            shipping_state: orderDetails.selectedAddress?.state || formData.state || 'No state provided',
            shipping_zip: orderDetails.selectedAddress?.zip_code || formData.zipCode || '00000',
            shipping_phone: formData.phone || '0000000000',
            shipping_fee: orderDetails.shippingFee || 0,
            customer_email: formData.email,
            notes: '',
            coupon_code: orderDetails.appliedCoupon?.code || '',
            subtotal: orderDetails.subtotal || 0,
            discount: orderDetails.discountAmount || 0,
            tax: orderDetails.taxAmount || 0,
            grand_total: orderDetails.total || 0,
            items: orderDetails.cartItems.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: parseFloat(item.product.sale_price) || parseFloat(item.product.base_price) || 0,
              product_name: item.product.name || 'Unknown Product',
              measurement_unit: item.measurement?.unit || 'unit',
              measurement_value: item.measurement?.value || '0',
              product_measurement_id: item.measurement?.id || null
            }))
          };
          
          console.log('Creating order in database before Flutterwave payment:', orderWithItems);
          
          // Create the order first
          const orderResponse = await api.post('/orders', orderWithItems);
          console.log('Order created successfully:', orderResponse.data);
          
          // Get the order ID from the response
          const orderId = orderResponse.data.order.id;
          const orderNumber = orderResponse.data.order.order_number || `ORD-${orderId}`;
          
          // Initialize Flutterwave payment with correct amount and order ID
          const paymentData = {
            email: formData.email,
            amount: orderDetails.total,
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            tx_ref: reference, // Use the same reference we included in the order
            redirect_url: `${window.location.origin}/payment/callback`,
            meta: {
              order_id: orderId,
              order_number: orderNumber,
              customer_name: `${formData.firstName} ${formData.lastName}`,
              customer_email: formData.email,
              shipping_address: orderDetails.selectedAddress?.address || formData.address || 'No address provided'
            }
          };
          
          console.log('Initializing Flutterwave payment with data:', paymentData);
          
          // Initialize Flutterwave payment
          const paymentResponse = await initializeFlutterwavePayment(paymentData);
          console.log('Flutterwave payment initialized:', paymentResponse);
          
          if (paymentResponse && paymentResponse.status === 'success' && paymentResponse.redirect_url) {
            // Store order data in localStorage for retrieval after payment
            localStorage.setItem('pendingOrder', JSON.stringify({
              orderId,
              orderNumber,
              reference,
              paymentMethod: 'flutterwave'
            }));
            
            // Redirect to Flutterwave payment page
            window.location.href = paymentResponse.redirect_url;
            return;
          } else {
            throw new Error('Invalid payment response: ' + JSON.stringify(paymentResponse));
          }
        } catch (error) {
          console.error('Flutterwave payment error:', error);
          setError('Payment initialization failed: ' + (error.message || 'Unknown error'));
          setLoading(false);
          return;
        }
      } else {
        // For Cash on Delivery or other payment methods, create order directly
        try {
          console.log('Creating order with Cash on Delivery or other payment method');
          
          // Create order data with the correct format for the backend
          const orderWithItems = {
            payment_method: formData.paymentMethod === 'paystack' || formData.paymentMethod === 'flutterwave' ? 'card' : 
                            formData.paymentMethod === 'cashOnDelivery' ? 'cash_on_delivery' : formData.paymentMethod,
            delivery_method: orderDetails.deliveryMethod === 'delivery' ? 'shipping' : orderDetails.deliveryMethod,
            shipping_address: orderDetails.selectedAddress.street || orderDetails.selectedAddress.address || formData.address || 'No address provided',
            shipping_city: orderDetails.selectedAddress.city || formData.city || 'No city provided',
            shipping_state: orderDetails.selectedAddress.state || formData.state || 'No state provided',
            shipping_zip: orderDetails.selectedAddress.postalCode || orderDetails.selectedAddress.zip_code || formData.zipCode || '00000',
            shipping_phone: formData.phone || '0000000000',
            shipping_fee: orderDetails.shippingFee || 0, 
            customer_email: formData.email, // Add customer email from the checkout form
            payment_reference: '',
            payment_status: 'pending',
            notes: '',
            coupon_code: orderDetails.appliedCoupon?.code || '',
            subtotal: orderDetails.subtotal || 0,
            discount: orderDetails.discountAmount || 0,
            tax: orderDetails.taxAmount || 0,
            grand_total: orderDetails.total || 0,
            items: orderDetails.cartItems.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: parseFloat(item.product.sale_price) || parseFloat(item.product.base_price) || 0,
              product_name: item.product.name || 'Unknown Product',
              measurement_unit: item.measurement?.unit || 'unit',
              measurement_value: item.measurement?.value || '0',
              product_measurement_id: item.measurement?.id || null
            }))
          };
          
          // Debug the items data
          console.log('COD - Cart items being sent:', orderWithItems.items);
          console.log('COD - Final order data being sent:', orderWithItems);
          
          try {
            console.log('COD - Creating order in backend...');
            const codOrderResponse = await api.post('/orders', orderWithItems);
            console.log('COD - Order creation response:', codOrderResponse.data);
            
            // Log email status for cash on delivery orders
            if (formData.paymentMethod === 'cashOnDelivery' && codOrderResponse.data.email_sent) {
              console.log(`✅ Order confirmation email sent successfully to customer email: ${formData.email}`);
            }
            
            // Clear cart and redirect to order confirmation
            clearCart();
            
            // Get the order ID from the response
            const codOrderId = codOrderResponse.data.order.id;
            
            // Create a user-friendly order number format
            const codOrderNumber = codOrderResponse.data.order.order_number || 
                               `ORD-${codOrderId}`;
            
            // Store the order ID in localStorage for the confirmation page to use
            localStorage.setItem('last_order_id', codOrderId);
            
            navigate(`/order-confirmation/${codOrderNumber}`);
          } catch (error) {
            console.error('Order creation error:', error);
            if (error.response) {
              console.error('Error response:', error.response.data);
              // Log detailed validation errors if available
              if (error.response.data.errors) {
                console.error('Validation errors:', error.response.data.errors);
              }
              setError(`Order creation failed: ${error.response.data.message || error.response.statusText}`);
            } else {
              setError('Order creation failed: ' + (error.message || 'Unknown error'));
            }
          }
        } catch (err) {
          console.error('Checkout error:', err);
          
          // Get more detailed error information if available
          if (err.response) {
            console.error('Error response data:', err.response.data);
            console.error('Error response status:', err.response.status);
            
            // Set a more specific error message if available from the API
            if (err.response.data && err.response.data.message) {
              setError(err.response.data.message);
            } else if (err.response.data && err.response.data.error) {
              setError(err.response.data.error);
            } else {
              setError(`Failed to process your order (${err.response.status}). Please try again.`);
            }
          } else {
            setError('Failed to process your order. Please try again.');
          }
          
          setLoading(false);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Checkout error:', err);
      
      // Get more detailed error information if available
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        // Set a more specific error message if available from the API
        if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError(`Failed to process your order (${err.response.status}). Please try again.`);
        }
      } else {
        setError('Failed to process your order. Please try again.');
      }
      
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">First Name</p>
                <p className="text-gray-900 border-b border-gray-200 pb-1">{formData.firstName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Last Name</p>
                <p className="text-gray-900 border-b border-gray-200 pb-1">{formData.lastName}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Email</p>
              <p className="text-gray-900 border-b border-gray-200 pb-1">{formData.email}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Phone</p>
              <p className="text-gray-900 border-b border-gray-200 pb-1">{formData.phone}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
              <p className="text-gray-900 border-b border-gray-200 pb-1">{formData.address}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">City</p>
                <p className="text-gray-900 border-b border-gray-200 pb-1">{formData.city}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">State</p>
                <p className="text-gray-900 border-b border-gray-200 pb-1">{formData.state}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Postal Code</p>
              <p className="text-gray-900 border-b border-gray-200 pb-1">{formData.zipCode}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Delivery Method</p>
              <p className="text-gray-900 border-b border-gray-200 pb-1 capitalize">
                {orderDetails?.deliveryMethod || 'Standard Delivery'}
                {orderDetails?.deliveryInfo && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({orderDetails.deliveryInfo.message})
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-4 mt-6">Payment Method</h2>
            
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="card"
                name="paymentMethod"
                value="card"
                checked={formData.paymentMethod === 'card'}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <label htmlFor="card" className="ml-2 block text-sm font-medium text-gray-700">
                Credit/Debit Card
              </label>
            </div>
              
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="paystack"
                name="paymentMethod"
                value="paystack"
                checked={formData.paymentMethod === 'paystack'}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <label htmlFor="paystack" className="ml-2 block text-sm font-medium text-gray-700">
                Paystack
              </label>
            </div>
              
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="flutterwave"
                name="paymentMethod"
                value="flutterwave"
                checked={formData.paymentMethod === 'flutterwave'}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <label htmlFor="flutterwave" className="ml-2 block text-sm font-medium text-gray-700">
                Flutterwave
              </label>
            </div>
              
            <div className="flex items-center">
              <input
                type="radio"
                id="cashOnDelivery"
                name="paymentMethod"
                value="cashOnDelivery"
                checked={formData.paymentMethod === 'cashOnDelivery'}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <label htmlFor="cashOnDelivery" className="ml-2 block text-sm font-medium text-gray-700">
                Cash on Delivery
              </label>
            </div>
          </div>
            
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
            
          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
        
        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div className="border-b pb-4 mb-4">
            {orderDetails?.cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="font-medium">{item.quantity} x</span>
                  <span className="ml-2">{item.product.name}</span>
                </div>
                <span>{formatNaira((parseFloat(item.product.sale_price) || parseFloat(item.product.base_price) || 0) * item.quantity)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-b pb-4 mb-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>{formatNaira(orderDetails?.subtotal || 0)}</span>
            </div>
            {/* Add discount display */}
            {orderDetails?.discountAmount > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-green-600">Discount</span>
                <span className="text-green-600">-{formatNaira(orderDetails?.discountAmount || 0)}</span>
              </div>
            )}
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>{formatNaira(orderDetails?.shippingFee || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (7.5%)</span>
              <span>{formatNaira(orderDetails?.taxAmount || 0)}</span>
            </div>
          </div>
          
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatNaira(orderDetails?.total || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
