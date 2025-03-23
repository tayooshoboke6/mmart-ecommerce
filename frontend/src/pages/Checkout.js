import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  
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
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);
  
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
      // Here you would typically make an API call to process the order
      // For now, we'll just simulate a successful order
      
      setTimeout(() => {
        // Clear the cart after successful order
        clearCart();
        
        // Redirect to a success page
        navigate('/order-success');
        
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError('Failed to process your order. Please try again.');
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
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="font-medium">{item.quantity} x</span>
                  <span className="ml-2">{item.name}</span>
                </div>
                <span>₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          
          <div className="border-b pb-4 mb-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>₦1,500.00</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (7.5%)</span>
              <span>₦{(cartTotal * 0.075).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₦{(cartTotal + 1500 + (cartTotal * 0.075)).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
