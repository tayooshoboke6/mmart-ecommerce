import React, { useState, useEffect } from 'react';
import api from '../../services/api';

// Mock data for users
const mockUsers = [
  {
    id: 1,
    name: 'Adebayo Johnson',
    email: 'adebayo@example.com',
    phone: '+234 801 234 5678',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-15T08:30:00.000Z',
    order_count: 0,
    total_spent: 0,
    default_address: {
      street: '25 Broad Street',
      city: 'Lagos',
      state: 'Lagos State',
      country: 'Nigeria'
    }
  },
  {
    id: 2,
    name: 'Chioma Okafor',
    email: 'chioma@example.com',
    phone: '+234 802 345 6789',
    role: 'customer',
    status: 'active',
    created_at: '2024-01-20T10:15:00.000Z',
    order_count: 5,
    total_spent: 75000,
    default_address: {
      street: '7 Park Avenue',
      city: 'Port Harcourt',
      state: 'Rivers State',
      country: 'Nigeria'
    }
  },
  {
    id: 3,
    name: 'Emeka Eze',
    email: 'emeka@example.com',
    phone: '+234 803 456 7890',
    role: 'customer',
    status: 'active',
    created_at: '2024-01-25T14:45:00.000Z',
    order_count: 3,
    total_spent: 42500,
    default_address: {
      street: '12 Unity Road',
      city: 'Abuja',
      state: 'FCT',
      country: 'Nigeria'
    }
  },
  {
    id: 4,
    name: 'Fatima Ibrahim',
    email: 'fatima@example.com',
    phone: '+234 804 567 8901',
    role: 'customer',
    status: 'active',
    created_at: '2024-02-05T09:20:00.000Z',
    order_count: 2,
    total_spent: 18500,
    default_address: {
      street: '5 Kano Road',
      city: 'Kano',
      state: 'Kano State',
      country: 'Nigeria'
    }
  },
  {
    id: 5,
    name: 'Gabriel Okonkwo',
    email: 'gabriel@example.com',
    phone: '+234 805 678 9012',
    role: 'customer',
    status: 'inactive',
    created_at: '2024-02-10T16:30:00.000Z',
    order_count: 1,
    total_spent: 9999,
    default_address: null
  },
  {
    id: 6,
    name: 'Hannah Adeyemi',
    email: 'hannah@example.com',
    phone: '+234 806 789 0123',
    role: 'customer',
    status: 'active',
    created_at: '2024-02-15T11:10:00.000Z',
    order_count: 4,
    total_spent: 56000,
    default_address: {
      street: '18 Ikorodu Road',
      city: 'Lagos',
      state: 'Lagos State',
      country: 'Nigeria'
    }
  },
  {
    id: 7,
    name: 'Ibrahim Musa',
    email: 'ibrahim@example.com',
    phone: '+234 807 890 1234',
    role: 'customer',
    status: 'active',
    created_at: '2024-02-20T13:25:00.000Z',
    order_count: 2,
    total_spent: 27500,
    default_address: {
      street: '9 Kaduna Street',
      city: 'Kaduna',
      state: 'Kaduna State',
      country: 'Nigeria'
    }
  },
  {
    id: 8,
    name: 'Joy Nwosu',
    email: 'joy@example.com',
    phone: '+234 808 901 2345',
    role: 'customer',
    status: 'active',
    created_at: '2024-02-25T15:40:00.000Z',
    order_count: 3,
    total_spent: 38000,
    default_address: {
      street: '14 Enugu Road',
      city: 'Enugu',
      state: 'Enugu State',
      country: 'Nigeria'
    }
  },
  {
    id: 9,
    name: 'Kingsley Adekunle',
    email: 'kingsley@example.com',
    phone: '+234 809 012 3456',
    role: 'admin',
    status: 'active',
    created_at: '2024-03-01T08:55:00.000Z',
    order_count: 0,
    total_spent: 0,
    default_address: null
  },
  {
    id: 10,
    name: 'Lola Bello',
    email: 'lola@example.com',
    phone: '+234 810 123 4567',
    role: 'customer',
    status: 'inactive',
    created_at: '2024-03-05T12:15:00.000Z',
    order_count: 1,
    total_spent: 12500,
    default_address: {
      street: '3 Ibadan Avenue',
      city: 'Ibadan',
      state: 'Oyo State',
      country: 'Nigeria'
    }
  }
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingUser, setViewingUser] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, searchQuery]);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Prepare parameters
      const params = {
        page: currentPage,
        role: roleFilter !== 'all' ? roleFilter : null,
        search: searchQuery || null
      };
      
      // Build the full URL with parameters
      const baseURL = (process.env.REACT_APP_API_URL || 'http://localhost:8000') + '/api';
      let fullURL = `${baseURL}/admin/users`;
      
      // Add parameters to URL for logging
      const queryParams = [];
      if (params.page) queryParams.push(`page=${params.page}`);
      if (params.role) queryParams.push(`role=${params.role}`);
      if (params.search) queryParams.push(`search=${encodeURIComponent(params.search)}`);
      
      if (queryParams.length > 0) {
        fullURL += `?${queryParams.join('&')}`;
      }
      
      // Log the full URL being called
      console.log('Calling full API URL:', fullURL);
      
      const response = await api.get('/admin/users', { params });
      
      // Log the response for debugging
      console.log('Users API Response:', response.data);
      
      // Handle different possible response formats
      if (response.data) {
        // Check if data is in the expected format
        if (Array.isArray(response.data.data)) {
          setUsers(response.data.data);
        } else if (response.data.data && Array.isArray(response.data.data.users)) {
          setUsers(response.data.data.users);
        } else if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          console.warn('Unexpected API response format:', response.data);
          setUsers([]);
        }
        
        // Set total pages
        if (response.data.last_page) {
          setTotalPages(response.data.last_page);
        } else if (response.data.data && response.data.data.meta && response.data.data.meta.last_page) {
          setTotalPages(response.data.data.meta.last_page);
        } else if (response.data.current_page) {
          setTotalPages(response.data.current_page);
        } else {
          setTotalPages(1);
        }
        
        setUsingMockData(false);
        setError(null);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      
      // Use mock data when API call fails
      let filteredUsers = [...mockUsers];
      
      // Apply role filter to mock data
      if (roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
      }
      
      // Apply search filter to mock data
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredUsers = filteredUsers.filter(
          user => 
            user.name.toLowerCase().includes(query) || 
            user.email.toLowerCase().includes(query) ||
            (user.phone && user.phone.toLowerCase().includes(query))
        );
      }
      
      setUsers(filteredUsers);
      setTotalPages(1);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      
      if (response.data.status === 'success') {
        // Update the user role in the local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        throw new Error(response.data.message || 'Failed to update user role');
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      
      if (usingMockData) {
        // Update the user role in the mock data
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        alert('Failed to update user role: ' + (err.message || 'Unknown error'));
      }
    }
  };
  
  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { 
        status: newStatus 
      });
      
      if (response.data.status === 'success') {
        // Update the user status in the local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ));
      } else {
        throw new Error(response.data.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      
      if (usingMockData) {
        // Update the user status in the mock data
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ));
      } else {
        alert('Failed to update user status: ' + (err.message || 'Unknown error'));
      }
    }
  };
  
  const handleViewUser = async (userId) => {
    try {
      if (usingMockData) {
        // Find the user in the mock data
        const user = mockUsers.find(user => user.id === userId);
        if (user) {
          setViewingUser(user);
          console.log('Viewing mock user data:', user);
          console.log('Mock pending_order_count:', user.pending_order_count);
        } else {
          throw new Error('User not found');
        }
      } else {
        const response = await api.get(`/admin/users/${userId}`);
        
        if (response.data.status === 'success') {
          console.log('Viewing API user data:', response.data.data);
          console.log('API pending_order_count:', response.data.data.pending_order_count);
          setViewingUser(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch user details');
        }
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      
      if (!usingMockData) {
        alert('Failed to fetch user details: ' + (err.message || 'Unknown error'));
      }
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-NG', options);
  };
  
  // Render loading state
  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Customers</h1>
        
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export CSV
          </button>
        </div>
      </div>
      
      {/* Mock data indicator */}
      {usingMockData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Using mock data. The actual API is currently unavailable.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Role filter */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
            </div>
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
                placeholder="Name, Email..."
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
      
      {/* User detail modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Customer Details
                    </h3>
                    
                    <div className="mt-2 space-y-4">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {viewingUser.avatar ? (
                            <img src={viewingUser.avatar} alt="User Avatar" className="h-full w-full rounded-full object-cover" />
                          ) : (
                            <span className="text-gray-700 font-medium">
                              {viewingUser.name ? viewingUser.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Name</p>
                          <p className="text-sm text-gray-900">{viewingUser.name}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-900">{viewingUser.email}</p>
                            {viewingUser.email_verified !== undefined && (
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${viewingUser.email_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {viewingUser.email_verified ? 'Verified' : 'Unverified'}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="text-sm text-gray-900">{viewingUser.phone || 'Not provided'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Role</p>
                          <p className="text-sm text-gray-900 capitalize">{viewingUser.role}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <p
                            className={`text-sm ${viewingUser.status === 'active' ? 'text-green-600' : 
                              viewingUser.status === 'inactive' ? 'text-red-600' : 
                              'text-yellow-600'
                            }`}
                          >
                            {viewingUser.status === 'active' ? 'Active' : 
                             viewingUser.status === 'inactive' ? 'Inactive' : 
                             'Suspended'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Joined</p>
                          <p className="text-sm text-gray-900">{formatDate(viewingUser.created_at)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500">Address Information</p>
                        <div className="text-sm text-gray-900 mt-1">
                          <p>{viewingUser.address || 'Address not provided'}</p>
                          <p>
                            {viewingUser.city && viewingUser.city !== 'Not provided' ? viewingUser.city : ''} 
                            {viewingUser.city && viewingUser.state && viewingUser.city !== 'Not provided' && viewingUser.state !== 'Not provided' ? ', ' : ''}
                            {viewingUser.state && viewingUser.state !== 'Not provided' ? viewingUser.state : ''}
                            {viewingUser.zip_code && viewingUser.zip_code !== 'Not provided' ? ` ${viewingUser.zip_code}` : ''}
                          </p>
                          {(!viewingUser.city || viewingUser.city === 'Not provided') && 
                           (!viewingUser.state || viewingUser.state === 'Not provided') && 
                           (!viewingUser.address || viewingUser.address === 'Not provided') && 
                           (!viewingUser.zip_code || viewingUser.zip_code === 'Not provided') && 
                            <p className="text-sm text-gray-500">No address information available</p>}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500">Order Statistics</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-500">Total Orders</p>
                            <p className="text-xl font-semibold text-gray-900">{viewingUser.order_count || 0}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-500">Total Spent</p>
                            <p className="text-xl font-semibold text-gray-900">₦{viewingUser.total_spent || 0}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="bg-blue-50 p-3 rounded-md">
                            <p className="text-sm text-gray-500">Completed Orders</p>
                            <p className="text-xl font-semibold text-blue-600">{viewingUser.completed_order_count || 0}</p>
                          </div>
                          <div className="bg-yellow-50 p-3 rounded-md">
                            <p className="text-sm text-gray-500">Pending Orders</p>
                            {console.log('Rendering pending_order_count:', viewingUser.pending_order_count)}
                            <p className="text-xl font-semibold text-yellow-600">{viewingUser.pending_order_count || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Users table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
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
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.avatar ? (
                              <img src={user.avatar} alt="User Avatar" className="h-full w-full rounded-full object-cover" />
                            ) : (
                              <span className="text-gray-700 font-medium">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.order_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                        className={`text-xs rounded-full font-semibold px-2 py-1 border-0 ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.status}
                        onChange={(e) => handleUpdateUserStatus(user.id, e.target.value)}
                        className={`text-xs rounded-full font-semibold px-2 py-1 border-0 ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 
                          user.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="text-primary hover:text-primary-dark"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found
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
                  Showing <span className="font-medium">{users.length > 0 ? (currentPage - 1) * 10 + 1 : 0}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * 10, (currentPage - 1) * 10 + users.length)}</span> of{' '}
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

export default Users;
