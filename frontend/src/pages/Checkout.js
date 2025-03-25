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
  
  // Calculate cart totals (same logic as in Cart.js)
  const subtotal = cartItems.reduce((total, item) => {
    const product = item.product || {};
    const itemPrice = parseFloat(product.sale_price) || parseFloat(product.base_price) || 0;
    return total + (itemPrice * item.quantity);
  }, 0);
  
  const shippingFee = subtotal > 10000 ? 0 : 1500; // Free shipping for orders over ₦10,000
  const tax = subtotal * 0.075; // 7.5% VAT
  const total = subtotal + shippingFee + tax;
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'card',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Redirect to cart if cart is empty
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
    
    try {
      console.log('Form data:', formData);
      console.log('Cart items:', cartItems);
      console.log('Order totals:', { subtotal, shippingFee, tax, total });
      
      // Create the order data according to backend expectations
      const orderData = {
        payment_method: formData.paymentMethod === 'paystack' || formData.paymentMethod === 'flutterwave' ? 'card' : 
                        formData.paymentMethod === 'cashOnDelivery' ? 'cash_on_delivery' : formData.paymentMethod,
        delivery_method: 'shipping', // Could be 'pickup' if you implement that option
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_state: formData.state,
        shipping_zip: formData.zipCode,
        shipping_phone: formData.phone,
        notes: '',  // Optional delivery notes
      };

      console.log('Order data being sent to API:', orderData);
      
      // Handle different payment methods
      if (formData.paymentMethod === 'paystack') {
        try {
          // Initialize Paystack payment
          const paymentData = {
            email: formData.email,
            amount: total * 100, // Convert to kobo (Naira's smallest unit)
            callback_url: `${window.location.origin}/payment/callback`
          };
          
          const paymentResponse = await initializePaystackPayment(paymentData);
          console.log('Paystack payment initialized:', paymentResponse);
          
          if (paymentResponse && paymentResponse.data && paymentResponse.data.authorization_url) {
            const reference = paymentResponse.data.reference;
            
            // Store order data in localStorage for retrieval after payment
            localStorage.setItem('pendingOrder', JSON.stringify({
              orderData,
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
          // Initialize Flutterwave payment
          const reference = generatePaymentReference();
          
          const paymentData = {
            email: formData.email,
            amount: total,
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            redirect_url: `${window.location.origin}/payment/callback`,
            meta: {
              order_reference: reference,
              customer_name: `${formData.firstName} ${formData.lastName}`,
              shipping_address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}`
            }
          };
          
          console.log('Initializing Flutterwave payment with data:', paymentData);
          
          // Create order data with the correct format for the backend
          const orderWithItems = {
            payment_method: formData.paymentMethod === 'paystack' || formData.paymentMethod === 'flutterwave' ? 'card' : 
                            formData.paymentMethod === 'cashOnDelivery' ? 'cash_on_delivery' : formData.paymentMethod,
            delivery_method: 'shipping',
            shipping_address: formData.address,
            shipping_city: formData.city,
            shipping_state: formData.state,
            shipping_zip: formData.zipCode,
            shipping_phone: formData.phone,
            customer_email: formData.email, // Add customer email from the checkout form
            payment_reference: reference,
            payment_status: 'pending',
            notes: '',
            items: cartItems.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: parseFloat(item.product.sale_price) || parseFloat(item.product.base_price) || 0,
              product_name: item.product.name || 'Unknown Product',
              measurement_unit: item.measurement?.unit || 'unit',
              measurement_value: item.measurement?.value || '0',
              product_measurement_id: item.measurement?.id || null
            }))
          };
          
          // Save the order first to get an order ID
          console.log('Creating pending order for Flutterwave payment:', orderWithItems);
          const orderResponse = await api.post('/orders', orderWithItems);
          console.log('Pending order created successfully:', orderResponse.data);
          
          // Get the order ID and number from the response
          const orderId = orderResponse.data.id || orderResponse.data.order?.id;
          const orderNumber = orderResponse.data.order_number || orderResponse.data.order?.order_number || `ORD-${orderId}`;
          
          // Add order ID to payment metadata
          paymentData.meta.order_id = orderId;
          paymentData.meta.order_number = orderNumber;
          
          // Initialize Flutterwave payment
          const paymentResponse = await initializeFlutterwavePayment(paymentData);
          console.log('Flutterwave payment initialized:', paymentResponse);
          
          if (paymentResponse && paymentResponse.status === 'success' && paymentResponse.data?.link) {
            // Store order data in localStorage for retrieval after payment
            localStorage.setItem('pendingOrder', JSON.stringify({
              orderId,
              orderNumber,
              reference,
              paymentMethod: 'flutterwave'
            }));
            
            // Redirect to Flutterwave payment page
            console.log('Redirecting to Flutterwave payment page:', paymentResponse.data.link);
            window.location.href = paymentResponse.data.link;
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
            delivery_method: 'shipping',
            shipping_address: formData.address,
            shipping_city: formData.city,
            shipping_state: formData.state,
            shipping_zip: formData.zipCode,
            shipping_phone: formData.phone,
            customer_email: formData.email, // Add customer email from the checkout form
            payment_reference: '',
            payment_status: 'pending',
            notes: '',
            items: cartItems.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: parseFloat(item.product.sale_price) || parseFloat(item.product.base_price) || 0,
              product_name: item.product.name || 'Unknown Product',
              measurement_unit: item.measurement?.unit || 'unit',
              measurement_value: item.measurement?.value || '0',
              product_measurement_id: item.measurement?.id || null
            }))
          };
          
          console.log('Final order data being sent:', orderWithItems);
          
          const orderResponse = await api.post('/orders', orderWithItems);
          console.log('Order created successfully:', orderResponse.data);
          
          // Log email status for cash on delivery orders
          if (formData.paymentMethod === 'cashOnDelivery' && orderResponse.data.email_sent) {
            console.log(`✅ Order confirmation email sent successfully to customer email: ${formData.email}`);
          }
          
          // Clear cart and redirect to order confirmation
          clearCart();
          
          // Get the order ID from the response
          const orderId = orderResponse.data.order.id;
          
          // Create a user-friendly order number format
          const orderNumber = orderResponse.data.order.order_number || 
                             `ORD-${orderId}`;
          
          // Store the order ID in localStorage for the confirmation page to use
          localStorage.setItem('last_order_id', orderId);
          
          navigate(`/order-confirmation/${orderNumber}`);
        } catch (error) {
          console.error('Order creation error:', error);
          if (error.response) {
            console.error('Error response:', error.response.data);
            setError(`Order creation failed: ${error.response.data.message || error.response.statusText}`);
          } else {
            setError('Order creation failed: ' + (error.message || 'Unknown error'));
          }
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
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Select State</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Rivers">Rivers</option>
                  <option value="Kano">Kano</option>
                  <option value="Enugu">Enugu</option>
                  <option value="Oyo">Oyo</option>
                  <option value="Kaduna">Kaduna</option>
                  <option value="Delta">Delta</option>
                  <option value="Anambra">Anambra</option>
                  <option value="Edo">Edo</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
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
            {cartItems.map((item) => (
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
              <span>{formatNaira(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>{formatNaira(shippingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (7.5%)</span>
              <span>{formatNaira(tax)}</span>
            </div>
          </div>
          
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
