import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrderService from '../services/order.service';
import Spinner from '../components/ui/Spinner';
import { formatNaira } from '../utils/format';

const OrderDetail = () => {
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && orderId) {
      fetchOrderDetails();
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await OrderService.getOrder(orderId);
      console.log('Order details:', response);
      setOrder(response.order || response);
      setError(null);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancelLoading(true);
    try {
      await OrderService.cancelOrder(orderId);
      // Refresh order details
      fetchOrderDetails();
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order. Please try again later.');
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-NG', options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <Link to="/orders" className="text-primary hover:underline">
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/orders" className="text-primary hover:underline">
            &larr; Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/orders" className="text-primary hover:underline">
          &larr; Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b">
          <div className="flex flex-wrap justify-between items-center">
            <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
            <div className="flex items-center">
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              {order.status === 'pending' && !cancelLoading && (
                <button
                  onClick={handleCancelOrder}
                  className="ml-4 text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Cancel Order
                </button>
              )}
              {cancelLoading && (
                <div className="ml-4">
                  <Spinner size="sm" />
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-600 mt-2">Placed on {formatDate(order.created_at)}</p>
        </div>

        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">SHIPPING ADDRESS</h3>
              <p className="text-gray-800">{order.shipping_address}</p>
              <p className="text-gray-800">{order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}</p>
              <p className="text-gray-800">Phone: {order.shipping_phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">PAYMENT INFORMATION</h3>
              <p className="text-gray-800">
                Method: {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 
                        order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}
              </p>
              <p className="text-gray-800 mt-1">
                Status: <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(order.payment_status)}`}>
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </span>
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
                {order.items && order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                        {item.measurement_unit && item.measurement_value && (
                          <div className="ml-2 text-xs text-gray-500">
                            ({item.measurement_value} {item.measurement_unit})
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatNaira(item.unit_price)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatNaira(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="flex justify-end">
              <div className="w-full md:w-1/3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatNaira(order.subtotal)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">{formatNaira(order.shipping_fee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">-{formatNaira(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">{formatNaira(order.tax)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 mt-2 pt-2">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold">{formatNaira(order.grand_total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
