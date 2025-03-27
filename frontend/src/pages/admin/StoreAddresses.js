import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import GooglePlacesAutocomplete from '../../components/GooglePlacesAutocomplete';
import GeofenceMap from '../../components/GeofenceMap';
import api from '../../services/api';

const StoreAddresses = () => {
  const [storeAddresses, setStoreAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [activeTab, setActiveTab] = useState('address');
  const [formData, setFormData] = useState({
    name: '',
    address_line1: '',
    city: '',
    state: '',
    formatted_address: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    is_active: true,
    opening_hours: '',
    delivery_base_fee: '0',
    delivery_fee_per_km: '0',
    delivery_radius_km: '10',
    free_delivery_threshold: '0',
    minimum_order_value: '0',
    geofence_coordinates: '',
    drawing_mode: false,
    is_pickup_location: false,
    is_delivery_location: false
  });

  // Fetch store addresses
  const fetchStoreAddresses = async () => {
    setLoading(true);
    try {
      console.log('Fetching store addresses from:', '/admin/store-addresses');
      const response = await api.get('/admin/store-addresses');
      console.log('Store addresses response:', response);
      if (response.data.status === 'success') {
        setStoreAddresses(response.data.data);
      } else {
        console.error('Failed response:', response.data);
        toast.error('Failed to fetch store addresses');
      }
    } catch (error) {
      console.error('Error fetching store addresses:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      toast.error(`Error fetching store addresses: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('Authentication check:', { 
      hasToken: !!token, 
      tokenPreview: token ? `${token.substring(0, 15)}...` : null,
      hasUser: !!user
    });
    
    fetchStoreAddresses();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    let formattedValue = value;
    
    // Format string decimal fields
    if (name === 'delivery_fee_per_km' || name === 'minimum_order_value') {
      // Remove non-numeric characters except decimal point
      formattedValue = value.replace(/[^0-9.]/g, '');
      // Ensure only one decimal point
      const parts = formattedValue.split('.');
      if (parts.length > 2) {
        formattedValue = parts[0] + '.' + parts.slice(1).join('');
      }
      // Always show 2 decimal places
      if (!formattedValue.includes('.')) {
        formattedValue += '.00';
      } else if (parts[1]?.length === 1) {
        formattedValue += '0';
      } else if (parts[1]?.length > 2) {
        formattedValue = parseFloat(formattedValue).toFixed(2);
      }
    }
    
    // Handle integer fields
    if (name === 'delivery_base_fee' || name === 'free_delivery_threshold') {
      formattedValue = Math.min(parseInt(value) || 0, 99999999);
    }
    
    // Handle delivery radius
    if (name === 'delivery_radius_km') {
      formattedValue = Math.max(Math.min(parseInt(value) || -1, 999), -1);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const resetForm = () => {
    setActiveTab('address');
    setFormData({
      name: '',
      formatted_address: '',
      phone: '',
      email: '',
      latitude: '',
      longitude: '',
      is_active: true,
      opening_hours: '',
      delivery_base_fee: '1500',
      delivery_fee_per_km: '100.00',
      delivery_radius_km: '-1',
      free_delivery_threshold: '99999999',
      minimum_order_value: '10.00',
      geofence_coordinates: '',
      is_pickup_location: false,
      is_delivery_location: false
    });
    setCurrentAddress(null);
    setShowModal(true);
  };

  // Open modal for creating a new address
  const handleAddNew = () => {
    setCurrentAddress(null);
    resetForm();
  };

  // Open modal for editing an existing address
  const handleEdit = (address) => {
    setCurrentAddress(address);
    setActiveTab('address');
    setFormData({
      name: address.name,
      address_line1: address.address_line1,
      city: address.city,
      state: address.state,
      formatted_address: address.formatted_address || '',
      phone: address.phone || '',
      email: address.email || '',
      latitude: address.latitude || '',
      longitude: address.longitude || '',
      is_active: address.is_active,
      opening_hours: address.opening_hours || '',
      delivery_base_fee: address.delivery_base_fee || '0',
      delivery_fee_per_km: address.delivery_fee_per_km || '0',
      delivery_radius_km: address.delivery_radius_km || '10',
      free_delivery_threshold: address.free_delivery_threshold || '0',
      minimum_order_value: address.minimum_order_value || '0',
      geofence_coordinates: address.geofence_coordinates || '',
      drawing_mode: address.drawing_mode || false,
      is_pickup_location: address.is_pickup_location,
      is_delivery_location: address.is_delivery_location
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convert string numbers to actual numbers and format JSON fields
      const payload = {
        name: formData.name,
        formatted_address: formData.formatted_address,
        phone: formData.phone || null,
        email: formData.email || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        is_active: formData.is_active,
        opening_hours: formData.opening_hours ? JSON.stringify({
          hours: formData.opening_hours
        }) : null,
        is_pickup_location: formData.is_pickup_location,
        is_delivery_location: formData.is_delivery_location,
        delivery_radius_km: formData.delivery_radius_km ? parseInt(formData.delivery_radius_km) : -1,
        geofence_coordinates: formData.geofence_coordinates ? JSON.stringify(
          formData.geofence_coordinates
            .split('),')
            .map(coord => {
              const [lat, lng] = coord
                .replace('(', '')
                .replace(')', '')
                .split(',')
                .map(num => parseFloat(num.trim()));
              return [lat, lng];
            })
        ) : null,
        delivery_base_fee: formData.delivery_base_fee ? Math.min(parseFloat(formData.delivery_base_fee), 99999999.99) : 0,
        delivery_fee_per_km: formData.delivery_fee_per_km ? parseFloat(formData.delivery_fee_per_km).toFixed(2) : "0.00",
        free_delivery_threshold: formData.free_delivery_threshold ? Math.min(parseFloat(formData.free_delivery_threshold), 99999999.99) : 0,
        minimum_order_value: formData.minimum_order_value ? parseFloat(formData.minimum_order_value).toFixed(2) : "0.00"
      };
      
      console.log('Submitting store data:', payload);
      
      let response;
      if (currentAddress) {
        response = await api.put(`/admin/store-addresses/${currentAddress.id}`, payload);
      } else {
        response = await api.post('/admin/store-addresses', payload);
      }

      if (response.data.status === 'success') {
        toast.success(currentAddress ? 'Store updated successfully' : 'Store created successfully');
        setShowModal(false);
        fetchStoreAddresses();
      }
    } catch (error) {
      console.error('Error saving store address:', error);
      toast.error(`Failed to save store: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle address deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this store address?')) {
      try {
        const response = await api.delete(`/admin/store-addresses/${id}`);
        if (response.data.status === 'success') {
          toast.success('Store address deleted successfully');
          fetchStoreAddresses();
        } else {
          toast.error(response.data.message || 'Failed to delete store address');
        }
      } catch (error) {
        console.error('Error deleting store address:', error);
        toast.error('Error deleting store address');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <style>
        {`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #ffffff;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #3b82f6;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 1;
          border-color: #e5e7eb;
          transition: all 0.3s;
        }
        .toggle-label {
          display: block;
          overflow: hidden;
          cursor: pointer;
          border-radius: 9999px;
          transition: background-color 0.3s;
        }
        `}
      </style>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Store Locations</h1>
        <button
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center"
          onClick={handleAddNew}
        >
          <FaPlus className="mr-2" /> Add New Location
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City/State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {storeAddresses.length > 0 ? (
                storeAddresses.map((address) => (
                  <tr key={address.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-primary mr-2" />
                        <div className="text-sm font-medium text-gray-900">{address.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {address.formatted_address ? (
                        <div>
                          <div>{address.formatted_address}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {address.address_line1}{address.city && `, ${address.city}`}
                            {address.state && `, ${address.state}`}
                          </div>
                        </div>
                      ) : (
                        <div>
                          {address.address_line1}{address.city && `, ${address.city}`}
                          <br />
                          {address.state}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{address.city}, {address.state}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {address.phone && (
                        <div className="text-sm text-gray-900">{address.phone}</div>
                      )}
                      {address.email && (
                        <div className="text-sm text-gray-500">{address.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${address.is_pickup_location ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {address.is_pickup_location ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${address.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {address.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(address)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No store addresses found. Click "Add New Location" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for adding/editing store addresses */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-3xl mx-4">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium">
                {currentAddress ? 'Edit Store Location' : 'Add New Store Location'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4">
                {/* Tabs */}
                <div className="flex border-b mb-4">
                  <button
                    type="button"
                    className={`py-2 px-4 font-medium ${activeTab === 'address' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('address')}
                  >
                    Address Information
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-4 font-medium ${activeTab === 'delivery' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('delivery')}
                  >
                    Delivery Settings
                  </button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto">
                  {activeTab === 'address' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Debug output */}
                      <div className="col-span-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                        <strong>Debug - Form Data:</strong>
                        <pre>{JSON.stringify(formData, null, 2)}</pre>
                      </div>
                      
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location Name*
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Address Line 1 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 1*
                        </label>
                        <GooglePlacesAutocomplete
                          value={formData.address_line1}
                          onChange={(value) => {
                            if (!value.includes(',')) {
                              setFormData({...formData, address_line1: value});
                            }
                          }}
                          onSelect={(addressData) => {
                            setFormData(prevData => ({
                              ...prevData,
                              address_line1: addressData.address_line1 || prevData.address_line1,
                              formatted_address: addressData.formatted_address || prevData.formatted_address,
                              city: addressData.city || prevData.city,
                              state: addressData.state || prevData.state,
                              latitude: addressData.latitude?.toString() || prevData.latitude,
                              longitude: addressData.longitude?.toString() || prevData.longitude
                            }));
                          }}
                          placeholder="Enter address"
                          className="w-full"
                        />
                      </div>
                      
                      {/* Full Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Address (from Google)
                        </label>
                        <input
                          type="text"
                          name="formatted_address"
                          value={formData.formatted_address}
                          onChange={handleChange}
                          readOnly
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                        <small className="text-muted">This field is automatically populated from Google Places</small>
                      </div>
                      
                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* State */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Latitude */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="0.0000001"
                          name="latitude"
                          value={formData.latitude}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Longitude */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="0.0000001"
                          name="longitude"
                          value={formData.longitude}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Opening Hours */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opening Hours
                        </label>
                        <textarea
                          name="opening_hours"
                          value={formData.opening_hours}
                          onChange={handleChange}
                          rows="2"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                          placeholder="e.g. Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed"
                        ></textarea>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'delivery' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="mb-2">
                        <h3 className="text-lg font-medium text-gray-800">Delivery Settings</h3>
                        <p className="text-sm text-gray-600">Configure delivery options for this store location</p>
                      </div>
                      
                      {/* Store Active, Pickup Available, Delivery Available */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="flex items-center">
                            <label className="block text-sm font-medium text-gray-700 mr-2">
                              Store Active
                            </label>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center">
                            <label className="block text-sm font-medium text-gray-700 mr-2">
                              Pickup Available
                            </label>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                name="is_pickup_location"
                                checked={formData.is_pickup_location}
                                onChange={handleChange}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center">
                            <label className="block text-sm font-medium text-gray-700 mr-2">
                              Delivery Available
                            </label>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                name="is_delivery_location"
                                checked={formData.is_delivery_location}
                                onChange={handleChange}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Delivery Radius */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Radius (KM)
                        </label>
                        <input
                          type="number"
                          name="delivery_radius_km"
                          value={formData.delivery_radius_km}
                          onChange={handleInputChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          placeholder="-1"
                          min="-1"
                          max="999"
                          step="1"
                        />
                      </div>
                      
                      {/* Drawing Mode */}
                      <div>
                        <div className="flex items-center">
                          <label className="block text-sm font-medium text-gray-700 mr-2">
                            Drawing Mode
                          </label>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              name="drawing_mode"
                              checked={formData.drawing_mode}
                              onChange={handleChange}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                      
                      {/* Delivery Zone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Zone
                        </label>
                        <div className="border border-gray-300 rounded-md p-4">
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Manual Geofence Coordinates Entry
                            </label>
                            <textarea
                              name="geofence_coordinates"
                              value={formData.geofence_coordinates}
                              onChange={handleChange}
                              rows="4"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                              placeholder="(longitude, latitude)... and form a closed polygon."
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">
                              Make sure coordinates are in the format (longitude, latitude)... and form a closed polygon.
                            </p>
                          </div>
                          
                          {/* Map for drawing geofence */}
                          <GeofenceMap
                            initialCoordinates={[]}
                            onCoordinatesChange={(coords) => 
                              setFormData({...formData, geofence_coordinates: coords})
                            }
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Delivery Base Fee */}
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Delivery Base Fee (₦)
                          </label>
                          <input
                            type="number"
                            name="delivery_base_fee"
                            value={formData.delivery_base_fee}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="1500"
                            min="0"
                            max="99999999"
                            step="1"
                          />
                        </div>
                        
                        {/* Delivery Fee Per KM */}
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Delivery Fee per KM (₦)
                          </label>
                          <input
                            type="text"
                            name="delivery_fee_per_km"
                            value={formData.delivery_fee_per_km}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="100.00"
                            pattern="\d+\.\d{2}"
                          />
                        </div>
                        
                        {/* Free Delivery Threshold */}
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Free Delivery Threshold (₦)
                          </label>
                          <input
                            type="number"
                            name="free_delivery_threshold"
                            value={formData.free_delivery_threshold}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="10000000"
                            min="0"
                            max="99999999"
                            step="1"
                          />
                        </div>
                        
                        {/* Minimum Order Value */}
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Minimum Order Value (₦)
                          </label>
                          <input
                            type="text"
                            name="minimum_order_value"
                            value={formData.minimum_order_value}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="10.00"
                            pattern="\d+\.\d{2}"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md"
                >
                  {currentAddress ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreAddresses;
