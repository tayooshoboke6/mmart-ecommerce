import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
  // Generate a random order number
  const orderNumber = `MMT-${Math.floor(100000 + Math.random() * 900000)}`;
  
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Successful!</h1>
        <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been placed successfully.</p>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <p className="text-sm text-gray-500 mb-1">Order Number</p>
          <p className="text-lg font-semibold">{orderNumber}</p>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          We've sent a confirmation email with your order details and tracking information.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Link 
            to="/orders" 
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-200"
          >
            View My Orders
          </Link>
          
          <Link 
            to="/" 
            className="w-full bg-white text-gray-700 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
