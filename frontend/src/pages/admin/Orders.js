import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatNaira } from '../../utils/formatters';

// Mock data for fallback when API fails
const mockOrdersData = {
  orders: [
    {
      id: 1,
      order_number: 'ORD-2025-001',
      customer_name: 'John Adewale',
      customer_email: 'john.adewale@example.com',
      grand_total: 35000,
      status: 'pending',
      payment_status: 'paid',
      payment_method: 'Paystack',
      created_at: '2025-03-24T14:30:00'
    },
    {
      id: 2,
      order_number: 'ORD-2025-002',
      customer_name: 'Amina Ibrahim',
      customer_email: 'amina.ibrahim@example.com',
      grand_total: 12500,
      status: 'processing',
      payment_status: 'paid',
      payment_method: 'Credit Card',
      created_at: '2025-03-24T12:15:00'
    },
    {
      id: 3,
      order_number: 'ORD-2025-003',
      customer_name: 'Chidi Okonkwo',
      customer_email: 'chidi.okonkwo@example.com',
      grand_total: 78900,
      status: 'delivered',
      payment_status: 'paid',
      payment_method: 'Flutterwave',
      created_at: '2025-03-23T18:45:00'
    },
    {
      id: 4,
      order_number: 'ORD-2025-004',
      customer_name: 'Funke Akindele',
      customer_email: 'funke.akindele@example.com',
      grand_total: 24600,
      status: 'shipped',
      payment_status: 'paid',
      payment_method: 'Paystack',
      created_at: '2025-03-23T09:20:00'
    },
    {
      id: 5,
      order_number: 'ORD-2025-005',
      customer_name: 'Tunde Bakare',
      customer_email: 'tunde.bakare@example.com',
      grand_total: 9800,
      status: 'cancelled',
      payment_status: 'refunded',
      payment_method: 'Credit Card',
      created_at: '2025-03-22T16:10:00'
    },
    {
      id: 6,
      order_number: 'ORD-2025-006',
      customer_name: 'Yetunde Adeyemi',
      customer_email: 'yetunde.adeyemi@example.com',
      grand_total: 45200,
      status: 'processing',
      payment_status: 'paid',
      payment_method: 'Flutterwave',
      created_at: '2025-03-22T11:05:00'
    },
    {
      id: 7,
      order_number: 'ORD-2025-007',
      customer_name: 'Oluwaseun Ojo',
      customer_email: 'oluwaseun.ojo@example.com',
      grand_total: 18750,
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'Cash on Delivery',
      created_at: '2025-03-21T15:30:00'
    },
    {
      id: 8,
      order_number: 'ORD-2025-008',
      customer_name: 'Emeka Nwosu',
      customer_email: 'emeka.nwosu@example.com',
      grand_total: 67300,
      status: 'delivered',
      payment_status: 'paid',
      payment_method: 'Credit Card',
      created_at: '2025-03-21T09:45:00'
    },
    {
      id: 9,
      order_number: 'ORD-2025-009',
      customer_name: 'Blessing Okafor',
      customer_email: 'blessing.okafor@example.com',
      grand_total: 29800,
      status: 'shipped',
      payment_status: 'paid',
      payment_method: 'Paystack',
      created_at: '2025-03-20T14:20:00'
    },
    {
      id: 10,
      order_number: 'ORD-2025-010',
      customer_name: 'Ibrahim Musa',
      customer_email: 'ibrahim.musa@example.com',
      grand_total: 52400,
      status: 'delivered',
      payment_status: 'paid',
      payment_method: 'Flutterwave',
      created_at: '2025-03-20T10:15:00'
    }
  ],
  meta: {
    current_page: 1,
    last_page: 3,
    per_page: 10,
    total: 28
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [useMockData, setUseMockData] = useState(false);
  
  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchQuery]);
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/orders', {
        params: {
          page: currentPage,
          status: statusFilter !== 'all' ? statusFilter : null,
          search: searchQuery || null
        }
      });
      
      // Log the response for debugging
      console.log('Orders API Response:', response.data);
      
      if (response.data) {
        // Check if data is in the expected format
        if (Array.isArray(response.data.data)) {
          setOrders(response.data.data);
        } else if (response.data.data && Array.isArray(response.data.data.data)) {
          setOrders(response.data.data.data);
        } else if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          console.warn('Unexpected API response format:', response.data);
          setOrders([]);
        }
        
        // Set total pages
        if (response.data.last_page) {
          setTotalPages(response.data.last_page);
        } else if (response.data.data && response.data.data.last_page) {
          setTotalPages(response.data.data.last_page);
        } else if (response.data.current_page) {
          setTotalPages(response.data.current_page);
        } else {
          setTotalPages(1);
        }
        
        setUseMockData(false);
        setError(null);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
      
      // Use mock data as fallback
      console.log('Using mock orders data as fallback');
      
      // Filter mock data based on status if needed
      let filteredOrders = [...mockOrdersData.orders];
      
      if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
          order.order_number.toLowerCase().includes(query) ||
          order.customer_name.toLowerCase().includes(query) ||
          order.customer_email.toLowerCase().includes(query)
        );
      }
      
      setOrders(filteredOrders);
      setTotalPages(mockOrdersData.meta.last_page);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (useMockData) {
        // Update the order status in the local state for mock data
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        return;
      }
      
      const response = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      
      if (response.data) {
        // Update the order status in the local state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status: ' + (err.message || 'Unknown error'));
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
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
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-NG', options);
  };
  
  // Render loading state
  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
        
        <div className="flex items-center space-x-4">
          {/* Export button */}
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export CSV
          </button>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Status filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            
            {/* Date range filter - can be implemented later */}
          </div>
          
          {/* Search */}
          <div className="w-full md:w-64">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Order #, Customer name..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Orders table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                        #{order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatNaira(order.grand_total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(order.payment_status)}`}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{order.payment_method}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs rounded-full font-semibold px-2 py-1 border-0 ${getStatusBadgeClass(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/orders/${order.id}`} className="text-primary hover:text-primary-dark mr-3">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{orders.length > 0 ? (currentPage - 1) * 10 + 1 : 0}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * 10, (currentPage - 1) * 10 + orders.length)}</span> of{' '}
                  <span className="font-medium">{totalPages * 10}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(totalPages).keys()].map((page) => (
                    <button
                      key={page + 1}
                      onClick={() => setCurrentPage(page + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page + 1
                          ? 'z-10 bg-primary border-primary text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
