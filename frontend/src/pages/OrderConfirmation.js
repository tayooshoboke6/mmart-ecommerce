import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrderService from '../services/order.service';
import Spinner from '../components/ui/Spinner';
import { formatNaira } from '../utils/format';

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayOrderNumber, setDisplayOrderNumber] = useState(orderNumber);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      // Try to get the order ID from localStorage first (most reliable)
      const storedOrderId = localStorage.getItem('last_order_id');
      
      let response;
      if (storedOrderId) {
        // If we have the stored ID, use it directly
        response = await OrderService.getOrder(storedOrderId);
        console.log('Order details from stored ID:', response);
      } else {
        // Fallback to trying to extract ID from the order number
        response = await OrderService.getOrderByNumber(orderNumber);
        console.log('Order details from order number:', response);
      }
      
      // Set the order data
      let orderData = response;
      
      // Check if the response has a data property (from backend API)
      if (response.data) {
        orderData = response.data;
      }
      
      // Check if the response has an order property (alternative format)
      if (response.order) {
        orderData = response.order;
      }
      
      console.log('Processed order data:', orderData);
      
      // Clear the localStorage after successful retrieval
      localStorage.removeItem('last_order_id');
      
      setOrder(orderData);
      
      // If the order has its own order_number, use that for display
      if (orderData.order_number) {
        setDisplayOrderNumber(orderData.order_number);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please check your order history.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-NG', options);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Information Unavailable</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
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
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
          
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
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Successful!</h1>
            <p className="text-gray-600 mb-2">Thank you for your purchase. Your order has been placed successfully.</p>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4 inline-block">
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="text-lg font-semibold">{displayOrderNumber}</p>
            </div>
            
            <p className="text-sm text-gray-500">
              We've sent a confirmation email with your order details to {order.customer_email || 'your registered email'}.
            </p>
          </div>

          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">SHIPPING ADDRESS</h3>
                <p className="text-gray-800 font-medium">{order.customer_name || 'Customer'}</p>
                <p className="text-gray-800">{order.shipping_address || order.address || 'Address not available'}</p>
                <p className="text-gray-800">
                  {order.shipping_city || order.city ? `${order.shipping_city || order.city}, ` : ''}
                  {order.shipping_state || order.state ? order.shipping_state || order.state : ''} 
                  {order.shipping_zip_code || order.shipping_zip ? order.shipping_zip_code || order.shipping_zip : ''}
                </p>
                <p className="text-gray-800">Phone: {order.shipping_phone || order.phone || 'Not provided'}</p>
                <p className="text-gray-800">Email: {order.customer_email || order.email || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">PAYMENT INFORMATION</h3>
                <p className="text-gray-800">
                  Method: {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 
                          order.payment_method === 'card' ? 'Credit/Debit Card' :
                          order.payment_method ? order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1) : 'Not specified'}
                </p>
                <p className="text-gray-800 mt-1">
                  Status: <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                    order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : 'Pending'}
                  </span>
                </p>
                <h3 className="text-sm font-medium text-gray-500 mt-4 mb-2">DELIVERY METHOD</h3>
                <p className="text-gray-800">
                  {order.delivery_method === 'shipping' ? 'Home Delivery' : 
                   order.delivery_method === 'pickup' ? 'Store Pickup' : 
                   'Standard Delivery'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{item.product_name || 'Product'}</div>
                            {item.measurement_unit && item.measurement_value && (
                              <div className="ml-2 text-xs text-gray-500">
                                ({item.measurement_value} {item.measurement_unit})
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatNaira(item.unit_price || 0)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatNaira((item.subtotal || (item.unit_price * item.quantity)) || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">
                        No items found in this order
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 border-t pt-6">
              <div className="flex justify-end">
                <div className="w-full md:w-1/3">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatNaira(order.subtotal || order.sub_total || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">{formatNaira(order.shipping_fee || order.shipping || 0)}</span>
                  </div>
                  {(order.discount > 0) && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-green-600">-{formatNaira(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatNaira(order.tax || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-200 mt-2 pt-2">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-lg font-bold">{formatNaira(order.grand_total || order.total || order.grandTotal || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 justify-center">
          <Link 
            to="/orders" 
            className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition-colors duration-200 text-center"
          >
            View My Orders
          </Link>
          
          <Link 
            to="/" 
            className="bg-white text-gray-700 py-2 px-6 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors duration-200 text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
